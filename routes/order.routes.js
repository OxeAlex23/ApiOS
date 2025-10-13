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
        const order = await Order.findOne({ trackCode }, '-__v');
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
                const productInfo = await Product.findById(op.ProductId,'ProductName ProductDescription ProductImgUrl');
                return productInfo  ? { ...productInfo.toObject(), orderProduct: op } : [];
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


