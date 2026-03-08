import express from 'express';
const router = express.Router();
import Order from './OrderSchema.js';
import OrderTrack from './OrderTrackSchema.js';
import OrderProduct from './OrderProductSchema.js';
import OrderService from './OrderServiceSchema.js';
import { calculateOrderTotal } from './calculateOrderTotal.js';
import authObjectId from '../../middleware/authObjectId.js';
import Product from '../product/ProductSchema.js';
import Service from '../service/ServiceSchema.js';
import Business from '../business/BusinessSchema.js';
import Customer from '../customer/CustomerSchema.js';
import ProductCategory from '../product/ProductCategorySchema.js';
import Employees from '../employee/EmployeeSchema.js';

router.get('/', async (req, res) => {
    const orders = await Order.find();
    if (!orders) {
        return res.json([]);
    }
    res.json(orders);
});

router.get('/ordersByBusiness/:businessId/:orderStatusId', async (req, res) => {
    const { businessId, orderStatusId } = req.params;
    try {
        const orders = await Order.find({ BusinessId: businessId });

        if (orders.length === 0) {
            return res.json([]);
        }

        const orderByStatus = orders.filter(os => os.OrderStatusId._id?.toString() === orderStatusId);
        res.status(200).json(orderByStatus);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/ordersByBusiness/:businessId', async (req, res) => {
    const businessId = req.params.businessId;

    if (!businessId) {
        return res.status(404).json({ msg: 'business Not Found!' });

    }

    try {

        const orders = await Order.find({ BusinessId: businessId });
        if (!orders) {
            return res.json([]);
        }
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});

router.get('/ordersByBusinessInProgress/:businessId', async (req, res) => {
    const { businessId } = req.params;
    try {
        const orders = await Order.find({ BusinessId: businessId }).populate("OrderStatusId", "OrderStatusDesc");
        if (orders.length === 0) {
            return res.json([]);
        }

        const ordersInProgress = orders.filter(os => !["Cancelado", "Concluído"].includes(os.OrderStatusId?.OrderStatusDesc));

        res.status(200).json(ordersInProgress || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/ordersInfoDashboard/:BusinessId', async (req, res) => {
    const { BusinessId } = req.params;
    const { StartDate, EndDate } = req.body;

    try {
        // Validar datas
        if ((StartDate && !EndDate) || (!StartDate && EndDate)) {
            return res.status(400).json({
                msg: "Both StartDate and EndDate must be provided"
            });
        }

        // Construir filtro de datas uma única vez
        const dateFilter = {};
        if (StartDate && EndDate) {
            const start = new Date(StartDate);
            start.setUTCHours(0, 0, 0, 0);
            const end = new Date(EndDate);
            end.setUTCHours(23, 59, 59, 999);
            dateFilter.CreatedAt = { $gte: start, $lte: end };
        }

        // Buscar todas as ordens com um único populate
        const orders = await Order.find({ BusinessId, ...dateFilter }).populate("OrderStatusId", "OrderStatusDesc");

        if (orders.length === 0) return res.json([]);

        // Classificar e calcular revenues em uma única passagem
        const stats = {
            inProcessOrders: [],
            completedOrders: [],
            canceledOrders: [],
            revenues: { inProcess: 0, completed: 0, canceled: 0 }
        };

        orders.forEach(os => {
            const status = os.OrderStatusId?.OrderStatusDesc;
            const total = (os.TotalAmount || 0) + (os.AdditionValue || 0);

            if (status === "Concluído") {
                stats.completedOrders.push(os);
                stats.revenues.completed += total;
            } else if (status === "Cancelado") {
                stats.canceledOrders.push(os);
                stats.revenues.canceled += total;
            } else if (["Em andamento", "Aguardando Cliente", "Orçamentos"].includes(status)) {
                stats.inProcessOrders.push(os);
                stats.revenues.inProcess += total;
            }
        });

        const completedOrderIds = stats.completedOrders.map(os => os._id);

        // Fazer requisições em paralelo
        const [servicesResult, productsResult, totalOrders, customersResult, employeesResult, productsRecordsResult, servicesRecordsResult] = await Promise.allSettled([
            OrderService.find({ OrderId: { $in: completedOrderIds } }).populate("ServiceId", "ServiceName"),
            OrderProduct.find({ OrderId: { $in: completedOrderIds } }).populate("ProductId", "ProductName ProductCategoryId"),
            Order.countDocuments({ BusinessId }),
            Customer.find({ BusinessId, ...dateFilter }),
            Employees.find({ BusinessId, ...dateFilter }),
            Product.find({ BusinessId, ...dateFilter }),
            Service.find({ BusinessId, ...dateFilter }),
        ]);

        const services = servicesResult.value || [];
        const products = productsResult.value || [];

        // Processar serviços mais comuns
        const serviceMap = services.reduce((acc, ser) => {
            const name = ser.ServiceId?.ServiceName;
            if (name) {
                acc[name] = (acc[name] || 0) + (ser.Quantity || 1);
            }
            return acc;
        }, {});

        const topFiveSer = Object.entries(serviceMap)
            .map(([name, quantity]) => ({ name, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        // Processar produtos mais vendidos
        const productMap = products.reduce((acc, pro) => {
            const name = pro.ProductId?.ProductName;
            if (name) {
                acc[name] = (acc[name] || 0) + (pro.Quantity || 1);
            }
            return acc;
        }, {});

        const topFivePro = Object.entries(productMap)
            .map(([name, quantity]) => ({ name, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        // Processar categorias de produtos
        const categoryMap = products.reduce((acc, pro) => {
            const categoryId = pro.ProductId?.ProductCategoryId?.toString();
            if (categoryId) {
                acc[categoryId] = (acc[categoryId] || 0) + 1;
            }
            return acc;
        }, {});

        let topFiveCategories = [];
        if (Object.keys(categoryMap).length > 0) {
            const categories = await ProductCategory.find({ _id: { $in: Object.keys(categoryMap) } });
            topFiveCategories = categories
                .map(cat => ({ name: cat.ProductCategoryDesc, quantity: categoryMap[cat._id.toString()] }))
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5);
        }

        return res.status(200).json({
            Os: {
                TotalOrdersInterval: orders.length,
                InProcessOrders: stats.inProcessOrders.length,
                CompletedOrders: stats.completedOrders.length,
                CanceledOrders: stats.canceledOrders.length,
            },
            ValuesInOrdes: {
                InProcessRevenue: stats.revenues.inProcess,
                CompletedRevenue: stats.revenues.completed,
                CanceledRevenue: stats.revenues.canceled,
            },
            MostCommonServices: topFiveSer,
            MostSoldProducts: topFivePro,
            MostSoldCategories: topFiveCategories,
            NewRecords: {
                TotalClients: customersResult.value?.length || 0,
                TotalProducts: productsRecordsResult.value?.length || 0,
                TotalServices: servicesRecordsResult.value?.length || 0,
                TotalProfissionals: employeesResult.value?.length || 0,
                TotalOrders: totalOrders.value || 0
            },
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


router.get('/orderByTrackCode/:trackCode', async (req, res) => {
    const { trackCode } = req.params;

    try {
        const order = await Order.findOne({ TrackCode: trackCode }, '-__v');
        if (!order) {
            return res.status(404).json({ msg: 'Order Not Found' });
        }


        const [orderProducts, orderServices, business, customer, trackList] = await Promise.all([
            OrderProduct.find({ OrderId: order._id }, '-OrderId -__v'),
            OrderService.find({ OrderId: order._id }, '-__v'),
            Business.findById(order.BusinessId, '-__v'),
            Customer.findById(order.CustomerId, '-__v'),
            OrderTrack.find({ OrderId: order._id }, '-__v')
        ]);

        const products = await Promise.all(
            orderProducts.map(async (op) => {
                const productInfo = await Product.findById(op.ProductId, 'ProductName ProductDescription ProductImgUrl');
                return productInfo ? { ...productInfo.toObject(), orderProduct: op } : [];
            })
        );


        const services = await Promise.all(
            orderServices.map(async (os) => {
                const serviceInfo = await Service.findById(os.ServiceId, 'ServiceName ServiceDescription ServiceImgUrl');
                return serviceInfo ? { ...serviceInfo.toObject(), orderService: os } : [];
            })
        );



        return res.status(200).json({
            order,
            business,
            customer,
            products,
            services,
            trackList
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});



router.get('/:id', authObjectId, async (req, res) => {
    const orderId = req.params.id;
    if (!orderId) {
        return res.status(404).json({ msg: 'order Not Found!' })
    }
    try {
        const order = await Order.findById(orderId).populate('UserId', 'FirstName LastName -_id')
            .populate('BusinessId', 'BusinessName -_id')
            .populate('CustomerId', '-__v -BusinessId -_id')
            .populate('OrderStatusId', '-_id -__v')
            .populate('RelatedEmployees', 'EmployeeName JobTitle -_id');

        if (!order) {
            return res.json([]);
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

});

router.post('/', async (req, res) => {

    try {

        const newOrder = await Order.create({ ...req.body });

        await calculateOrderTotal(newOrder._id);


        const updatedOrder = await Order.findById(newOrder._id);

        res.status(201).json({ msg: 'order crated successfully!', order: updatedOrder });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', authObjectId, async (req, res) => {
    const orderId = req.params.id;
    if (!orderId) {
        return res.status(404).json({ msg: 'order Not Found!' });
    }

    try {
        const updateOrder = await Order.findByIdAndUpdate(orderId, req.body, { new: true });
        res.status(200).json({ msg: 'order updated successfully!', updateOrder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authObjectId, async (req, res) => {
    const orderId = req.params.id;
    if (!orderId) {
        return res.status(404).json({ msg: 'order Not Found!' });
    }

    try {
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        res.status(200).json({ msg: 'order deleted successfully!', deletedOrder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;


