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
    const { StartDate, EndDate } = req.body;

    try {
        const today = new Date();
        const end = EndDate ? new Date(EndDate) : null;
        const isToday = end && end.toDateString() === today.toDateString();

        const filter = {
            BusinessId,
            CanceledAt: { $exists: false },
            FinishedAt: { $exists: false },
        };

        if (StartDate || EndDate) {
            const dateFilter = {};

            if (StartDate) {
                dateFilter.$gte = new Date(StartDate);
            }

            if (EndDate) {
                const endOfDay = isToday ? new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59) : new Date(EndDate);

                dateFilter.$lte = endOfDay;
            }

            filter.createdAt = dateFilter;
        }

        const orders = await Order.find(filter).populate("OrderStatusId", "OrderStatusDesc");

        if (orders.length === 0) return res.json([]);

        let inProcessOrders = [];
        let completedOrders = [];
        let canceledOrders = [];

        for (const os of orders) {
            const status = os.OrderStatusId?.OrderStatusDesc;
            if (status === "Concluído") completedOrders.push(os);
            else if (status === "Cancelado") canceledOrders.push(os);
            else inProcessOrders.push(os);
        }

        let completedRevenue = completedOrders.reduce((sum, os) => {
            const total = (os.TotalAmount || 0) + (os.AdditionValue || 0);
            return sum + total;
        }, 0);

        let inProcessRevenue = inProcessOrders.reduce((sum, os) => {
            const total = (os.TotalAmount || 0) + (os.AdditionValue || 0);
            return sum + total;
        }, 0);

        let canceledRevenue = canceledOrders.reduce((sum, os) => {
            const total = (os.TotalAmount || 0) + (os.AdditionValue || 0);
            return sum + total;
        }, 0);

        if (!isToday) {
            inProcessOrders = [];
            inProcessRevenue = 0;
        }

        const orderIds = completedOrders.map(os => os._id);

        const [services, products, totalOrders] = await Promise.all([
            OrderService.find({ OrderId: { $in: orderIds } }).populate("ServiceId", "ServiceName"),
            OrderProduct.find({ OrderId: { $in: orderIds } }).populate("ProductId", "ProductName ProductCategoryId"),
            Order.countDocuments({ BusinessId })

        ]);

        const mostCommonServices = services.reduce((acmSer, ser) => {
            const name = ser.ServiceId?.ServiceName;
            const quantity = ser.Quantity || 1;
            acmSer[name] = acmSer[name]
                ? { name, quantity: acmSer[name].quantity + quantity }
                : { name, quantity };
            return acmSer;
        }, {});

        const topFiveSer = Object.values(mostCommonServices)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        const mostSoldProducts = products.reduce((acmPro, pro) => {
            const name = pro.ProductId?.ProductName;
            const quantity = pro.Quantity || 1;
            acmPro[name] = acmPro[name]
                ? { name, quantity: acmPro[name].quantity + quantity }
                : { name, quantity };
            return acmPro;
        }, {});

        const topFivePro = Object.values(mostSoldProducts)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        const productCategoriesIds = products.map(p => p.ProductId?.ProductCategoryId?.toString());
        const categories = await ProductCategory.find({ _id: { $in: productCategoriesIds } });

        const countCat = categories.reduce((sum, cat) => {
            const name = cat.ProductCategoryDesc;
            sum[name] = sum[name]
                ? { name, quantity: sum[name].quantity + 1 }
                : { name, quantity: 1 };
            return sum;
        }, {});

        const topFiveCategories = Object.values(countCat)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        const filterNewsRecords = {
            BusinessId,
            ...((StartDate || EndDate) && {
                CreatedAt: {
                    ...(StartDate && { $gte: new Date(StartDate) }),
                    ...(EndDate && {
                        $lte: (() => {
                            const end = new Date(EndDate);
                            end.setHours(23, 59, 59, 999); 
                            return end;
                        })()
                    })
                }
            })
        };

        const [customersResult, employeesResult, productsResult, servicesResult] = await Promise.allSettled([
            Customer.find(filterNewsRecords),
            Employees.find(filterNewsRecords),
            Product.find(filterNewsRecords),
            Service.find(filterNewsRecords),
        ]);


        const customers = customersResult.value || [];
        const employees = employeesResult.value || [];
        const productsByBusiness = productsResult.value || [];
        const servicesByBusiness = servicesResult.value || [];

        return res.status(200).json({
            Os: {
                TotalOrdersInterval: orders.length,
                InProcessOrders: inProcessOrders.length,
                CompletedOrders: completedOrders.length,
                CanceledOrders: canceledOrders.length,
            },
            ValuesInOrdes: {
                InProcessRevenue: inProcessRevenue,
                CompletedRevenue: completedRevenue,
                CanceledRevenue: canceledRevenue,
            },
            MostCommonServices: topFiveSer,
            MostSoldProducts: topFivePro,
            MostSoldCategories: topFiveCategories,
            NewRecords: {
                TotalClients: customers.length,
                TotalProducts: productsByBusiness.length,
                TotalServices: servicesByBusiness.length,
                TotalProfissionals: employees.length,
                TotalOrders: totalOrders
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


