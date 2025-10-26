import express from 'express';
const router = express.Router();
import Order from '../models/OrderSchema.js';
import OrderTrack from '../models/OrderTrackSchema.js';
import OrderProduct from '../models/OrderProductSchema.js';
import OrderService from '../models/OrderServiceSchema.js';
import { calculateOrderTotal } from './calculateOrderTotal.js';
import authObjectId from '../middleware/authObjectId.js';
import Product from '../models/ProductSchema.js';
import Service from '../models/ServicesSchema.js';
import Business from '../models/BusinessSchema.js';
import Customer from '../models/CustomerSchema.js';
import ProductCategory from '../models/ProductCategorySchema.js';
import Employees from '../models/EmployeeSchema.js';

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

router.get('/ordersInfoDashboard/:BusinessId', async (req, res) => {
    const { BusinessId } = req.params;
     const { StartDate, EndDate } = req.body; // falta adicionar os filtros de data
    try {
        
        const orders = await Order.find({ BusinessId }).populate("OrderStatusId", "OrderStatusDesc");
        if (orders.length === 0) {
            return res.json([]);
        }

        let inProcessOrders = [];
        let completedOrders = [];
        let canceledOrders = [];

        for (const os of orders) {
            const status = os.OrderStatusId?.OrderStatusDesc;
            if (status === "Concluído") {
                completedOrders.push(os)
            } else if (status === "Cancelado") {
                canceledOrders.push(os)
            } else {
                inProcessOrders.push(os)
            }
        }
        const inProcessRevenue = inProcessOrders.filter(os => os.TotalAmount).reduce((sum, os) => sum + os.TotalAmount, 0);
        const completedRevenue = completedOrders.filter(os => os.TotalAmount).reduce((sum, os) => sum + os.TotalAmount, 0);
        const canceledRevenue = canceledOrders.filter(os => os.TotalAmount).reduce((sum, os) => sum + os.TotalAmount, 0);
        const orderIds = completedOrders.map(os => os._id);

        const [services, products] = await Promise.all([
            OrderService.find({ OrderId: { $in: orderIds } }).populate("ServiceId", "ServiceName"),
            OrderProduct.find({ OrderId: { $in: orderIds } }).populate("ProductId", "ProductName ProductCategoryId")
        ]);

        const mostCommonServices = services.reduce((acmSer, ser) => {
            const name = ser.ServiceId?.ServiceName;
            const quantity = ser.Quantity || 1;

            if (!acmSer[name]) {
                acmSer[name] = { name, quantity: 0 }
            }
            acmSer[name].quantity += quantity;
            return acmSer
        }, {});

        const sortedService = Object.values(mostCommonServices).sort((a, b) => b.quantity - a.quantity);
        const topFiveSer = sortedService.slice(0, 5);

        const mostSoldProducts = products.reduce((acmPro, pro) => {
            const name = pro.ProductId?.ProductName;
            const quantity = pro.Quantity || 1;

            if (!acmPro[name]) {
                acmPro[name] = { name, quantity: 0 };
            }

            acmPro[name].quantity += quantity;
            return acmPro;
        }, {});

        const sortedProduct = Object.values(mostSoldProducts).sort((a, b) => b.quantity - a.quantity);
        const topFivePro = sortedProduct.slice(0, 5);

        const productCategoriesIds = products.map(p => p.ProductId?.ProductCategoryId.toString());
        const categories = await ProductCategory.find({ _id: { $in: productCategoriesIds } });

        const countCat = categories.reduce((sum, cat) => {
            const name = cat.ProductCategoryDesc;
            const quantity = 1;

            if (!sum[name]) {
                sum[name] = { name, quantity: 0 }
            }

            sum[name].quantity += quantity;
            return sum;
        }, {});

        const sortedCategories = Object.values(countCat).sort((a, b) => b.quantity - a.quantity);
        const topFiveCategories = sortedCategories.slice(0, 5);

        const [customersResult, employeesResult, productsResult, servicesResult] = await Promise.allSettled([
            Customer.find({ BusinessId }),
            Employees.find({ BusinessId }),
            Product.find({ BusinessId }),
            Service.find({ BusinessId })
        ]);

        const customers = customersResult.status === 'fulfilled' ? customersResult.value : [];
        const employees = employeesResult.status === 'fulfilled' ? employeesResult.value : [];
        const productsByBusiness = productsResult.status === 'fulfilled' ? productsResult.value : [];
        const servicesByBusiness = servicesResult.status === 'fulfilled' ? servicesResult.value : [];

        const customersCount = customers.length;
        const employeesCount = employees.length;
        const productsCount = productsByBusiness.length;
        const servicesCount = servicesByBusiness.length;

        res.status(200).json({
            Os: {
                TotalOrders: orders.length,
                InProcessOrders: inProcessOrders.length,
                CompletedOrders: completedOrders.length,
                CanceledOrders: canceledOrders.length
            },
            ValuesInOrdes: {
                InProcessRevenue: inProcessRevenue,
                CompletedRevenue: completedRevenue,
                CanceledRevenue: canceledRevenue
            },
            MostCommonServices: topFiveSer.map(item => ({
                Name: item.name,
                Quantity: item.quantity
            })) || [],
            MostSoldProducts: topFivePro.map(item => ({
                Name: item.name,
                Quantity: item.quantity
            })) || [],
            MostSoldCategories: topFiveCategories.map(item => ({
                Name: item.name,
                Quantity: item.quantity
            })) || [],
            NewRecords: {
                TotalClients: customersCount,
                TotalProducts: productsCount,
                TotalServices: servicesCount,
                TotalProfissionals: employeesCount
            }
        });
    
    } catch (err) {
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

        const newOrder = await Order.create(req.body);

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


