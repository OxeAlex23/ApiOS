import express from 'express';
const router = express.Router();
import Order from '../models/OrderSchema.js';
import OrderTrack from '../models/OrderTrackSchema.js';
import OrderProduct from '../models/OrderProductSchema.js';
import OrderService from '../models/OrderServiceSchema.js';
import { calculateOrderTotal } from './calculateOrderTotal.js';
import authObjectId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    const orders = await Order.find();
    if (!orders) {
        return res.json([]);
    }
    res.json(orders);
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
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});

router.get('/orderByTrackCode/:trackCode', async (req, res) => {
    const { trackCode } = req.params;

    try {

        const orderTrack = await OrderTrack.findOne({ TrackCode: trackCode })
            .populate('OrderStatusId');

        if (!orderTrack) {
            return res.json({msg: 'orderTrack Not Found'});
        }

        const order = await Order.findById(orderTrack.OrderId);

        if (!order) {
            return res.json({msg: 'Order Not Found'});
        }

        const orderProducts = await OrderProduct.find({ OrderId: order._id })
            .populate('ProductId');
        if (!orderProducts) {
            return res.json([]);
        }

        const orderServices = await OrderService.find({ OrderId: order._id })
            .populate('ServiceId');
        if (!orderServices) {
            return res.json([]);
        }

        const budget = {
            itens: [
                ...orderProducts.map(op => ({
                    Type: 'Product',
                    Name: op.ProductId?.ProductName,
                    Quant: op.Quantity,
                    UnitPrice: op.UnitPriceAtOrder,
                    Subtotal: op.Quantity * op.UnitPriceAtOrder
                })),
                ...orderServices.map(os => ({
                    Type: 'Service',
                    Name: os.ServiceId?.ServiceName,
                    UnitPrice: os.UnitPriceAtOrder || os.ServiceId?.BasePrice
                }))
            ],
            TotalPrice: order.totalPrice,
            Approved: order.isApproved
        };

        const trackOrder = {
            Status: orderTrack.OrderStatusId?.OrderStatusDesc
        };

        return res.status(200).json({
            budget,
            trackOrder
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
    const { Title, UserId, BusinessId, CustomerId, OrderStatusId, TotalAmount, DiscountAmount, Notes, trackCode, RelatedEmployees, Priority } = req.body;
    if (!Title || !UserId || !BusinessId || !CustomerId || !OrderStatusId) {
        return res.status(400).json({ error: 'All required fields must be completed!' });
    }
    try {
        const order = await Order.create({ Title, UserId, BusinessId, CustomerId, OrderStatusId, TotalAmount, DiscountAmount, Notes, trackCode, RelatedEmployees, Priority });
        res.status(201).json({ msg: 'order created successfully!', order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { Title, UserId, BusinessId, CustomerId, OrderStatusId, TotalAmount, DiscountAmount, Notes, trackCode, RelatedEmployees, Priority } = req.body;


    try {

        const newOrder = await Order.create({ Title, UserId, BusinessId, CustomerId, OrderStatusId, TotalAmount, DiscountAmount, Notes, trackCode, RelatedEmployees, Priority });

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


