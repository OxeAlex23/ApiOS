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
import Employees from '../employee/EmployeeSchema.js';
import mongoose from 'mongoose';

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

        const orders = await Order.find({ BusinessId: businessId }).populate('OrderStatusId', 'OrderStatusDesc -_id');
        if (!orders) {
            return res.json([]);
        }
        res.status(200).json({ orders, "total": orders.length });
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

    if ((StartDate && !EndDate) || (!StartDate && EndDate)) {
        return res.status(400).json({
            msg: "Both StartDate and EndDate must be provided"
        });
    }

    try {

        console.time("DashboardStats");

        const businessObjectId = new mongoose.Types.ObjectId(BusinessId);

        const dateFilter = StartDate && EndDate
            ? {
                CreatedAt: {
                    $gte: new Date(StartDate),
                    $lte: new Date(EndDate)
                }
            }
            : {};

        const stats = await Order.aggregate([

            {
                $match: {
                    BusinessId: businessObjectId
                }
            },
            {
                $facet: {

                    periodStats: [

                        ...(StartDate && EndDate ? [{ $match: dateFilter }] : []),

                        {
                            $addFields: {
                                orderStatusObjId: {
                                    $cond: [
                                        { $and: [{ $ne: ["$OrderStatusId", null] }, { $ne: ["$OrderStatusId", ""] }] },
                                        { $toObjectId: "$OrderStatusId" },
                                        null
                                    ]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: "orderstatuses",
                                localField: "orderStatusObjId",
                                foreignField: "_id",
                                as: "statusInfo"
                            }
                        },
                        { $unwind: { path: "$statusInfo", preserveNullAndEmptyArrays: true } },
                        {
                            $addFields: {
                                total: {
                                    $add: [
                                        { $ifNull: ["$TotalAmount", 0] },
                                        { $ifNull: ["$AdditionValue", 0] }
                                    ]
                                },
                                statusDesc: {
                                    $ifNull: ["$statusInfo.OrderStatusDesc", "Desconhecido"]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,

                                PeriodTotalOrders: { $sum: 1 },

                                PeriodInProcessOrders: {
                                    $sum: {
                                        $cond: [
                                            { $not: { $in: ["$statusDesc", ["Concluído", "Cancelado"]] } },
                                            1,
                                            0
                                        ]
                                    }
                                },

                                PeriodCompletedOrders: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$statusDesc", "Concluído"] },
                                            1,
                                            0
                                        ]
                                    }
                                },

                                PeriodCanceledOrders: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$statusDesc", "Cancelado"] },
                                            1,
                                            0
                                        ]
                                    }
                                },

                                InProcessRevenue: {
                                    $sum: {
                                        $cond: [
                                            { $not: { $in: ["$statusDesc", ["Concluído", "Cancelado"]] } },
                                            "$total",
                                            0
                                        ]
                                    }
                                },

                                CompletedRevenue: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$statusDesc", "Concluído"] },
                                            "$total",
                                            0
                                        ]
                                    }
                                },

                                CanceledRevenue: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$statusDesc", "Cancelado"] },
                                            "$total",
                                            0
                                        ]
                                    }
                                },
                                completedOrderIds: {
                                    $push: {
                                        $cond: [
                                            { $eq: ["$statusDesc", "Concluído"] },
                                            "$_id",
                                            "$$REMOVE"
                                        ]
                                    }
                                }

                            }
                        }
                    ],

                    totalStats: [

                        {
                            $addFields: {
                                orderStatusObjId: {
                                    $cond: [
                                        { $and: [{ $ne: ["$OrderStatusId", null] }, { $ne: ["$OrderStatusId", ""] }] },
                                        { $toObjectId: "$OrderStatusId" },
                                        null
                                    ]
                                }
                            }
                        },

                        {
                            $lookup: {
                                from: "orderstatuses",
                                localField: "orderStatusObjId",
                                foreignField: "_id",
                                as: "statusInfo"
                            }
                        },

                        { $unwind: { path: "$statusInfo", preserveNullAndEmptyArrays: true } },

                        {
                            $addFields: {
                                statusDesc: {
                                    $ifNull: ["$statusInfo.OrderStatusDesc", "Desconhecido"]
                                }
                            }
                        },

                        {
                            $group: {
                                _id: null,

                                TotalOrders: { $sum: 1 },

                                TotalInProcessOrders: {
                                    $sum: {
                                        $cond: [
                                            { $not: { $in: ["$statusDesc", ["Concluído", "Cancelado"]] } },
                                            1,
                                            0
                                        ]
                                    }
                                },

                                TotalCompletedOrders: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$statusDesc", "Concluído"] },
                                            1,
                                            0
                                        ]
                                    }
                                },

                                TotalCanceledOrders: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$statusDesc", "Cancelado"] },
                                            1,
                                            0
                                        ]
                                    }
                                }

                            }
                        }

                    ]

                }
            }

        ]);

        const period = stats[0].periodStats[0] || {};
        const total = stats[0].totalStats[0] || {};

        const completedOrderIds = period.completedOrderIds || [];

        const dashboard = await OrderProduct.aggregate([

            { $match: { OrderId: { $in: completedOrderIds } } },

            {
                $facet: {

                    topProducts: [

                        {
                            $lookup: {
                                from: "products",
                                localField: "ProductId",
                                foreignField: "_id",
                                as: "product"
                            }
                        },

                        { $unwind: "$product" },

                        {
                            $group: {
                                _id: "$product.ProductName",
                                quantity: { $sum: { $ifNull: ["$Quantity", 1] } }
                            }
                        },

                        { $sort: { quantity: -1 } },
                        { $limit: 5 },

                        {
                            $project: {
                                _id: 0,
                                name: "$_id",
                                quantity: 1
                            }
                        }

                    ],

                    topCategories: [

                        {
                            $lookup: {
                                from: "products",
                                localField: "ProductId",
                                foreignField: "_id",
                                as: "product"
                            }
                        },

                        { $unwind: "$product" },

                        {
                            $lookup: {
                                from: "productcategories",
                                localField: "product.ProductCategoryId",
                                foreignField: "_id",
                                as: "category"
                            }
                        },

                        { $unwind: "$category" },

                        {
                            $group: {
                                _id: "$category.ProductCategoryDesc",
                                quantity: { $sum: 1 }
                            }
                        },

                        { $sort: { quantity: -1 } },
                        { $limit: 5 },

                        {
                            $project: {
                                _id: 0,
                                name: "$_id",
                                quantity: 1
                            }
                        }

                    ]

                }
            }

        ]);

        const topServices = await OrderService.aggregate([

            { $match: { OrderId: { $in: completedOrderIds } } },

            {
                $lookup: {
                    from: "services",
                    localField: "ServiceId",
                    foreignField: "_id",
                    as: "service"
                }
            },

            { $unwind: "$service" },

            {
                $group: {
                    _id: "$service.ServiceName",
                    quantity: { $sum: { $ifNull: ["$Quantity", 1] } }
                }
            },

            { $sort: { quantity: -1 } },
            { $limit: 5 },

            {
                $project: {
                    _id: 0,
                    name: "$_id",
                    quantity: 1
                }
            }

        ]);

        const result = dashboard[0] || {};

        console.timeEnd("DashboardStats");

        return res.json({

            Os: {
                TotalOrders: total.TotalOrders || 0,
                PeriodTotalOrders: period.PeriodTotalOrders || 0,

                TotalInProcessOrders: total.TotalInProcessOrders || 0,
                PeriodInProcessOrders: period.PeriodInProcessOrders || 0,

                TotalCompletedOrders: total.TotalCompletedOrders || 0,
                PeriodCompletedOrders: period.PeriodCompletedOrders || 0,

                TotalCanceledOrders: total.TotalCanceledOrders || 0,
                PeriodCanceledOrders: period.PeriodCanceledOrders || 0
            },
            ValuesInOrders: {
                InProcessRevenue: period.InProcessRevenue || 0,
                CompletedRevenue: period.CompletedRevenue || 0,
                CanceledRevenue: period.CanceledRevenue || 0

            },
            MostCommonServices: topServices || [],
            MostSoldProducts: result.topProducts || [],
            MostSoldCategories: result.topCategories || []

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            msg: "Error loading dashboard"
        });

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


