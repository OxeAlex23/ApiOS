import express from 'express';
const router = express.Router();
import OrderProduct from '../models/OrderProductSchema.js';
import authObjectId from '../middleware/authObjectId.js';
import Order from '../models/OrderSchema.js';
import { calculateOrderTotal } from './calculateOrderTotal.js';

router.get('/', async (req, res) => {
    const orderProducts = await OrderProduct.find();
    if (!orderProducts) {
        return res.json([]);
    }
    res.json(orderProducts);
});

router.get('/orderByOrderProduct/:orderId', async (req, res) => {
    const { orderId } = req.params;
    if (!orderId) {
        return res.status(404).json({ msg: 'Order Not Found!' });
    }

    try {
        const ordersProducts = await Order.find({ OrderId: orderId });
        if (!ordersProducts) {
            return res.json([]);
        }
        res.status(200).json(ordersProducts);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
})

router.get('/:id', authObjectId, async (req, res) => {
    const orderProductId = req.params.id;
    if (!orderProductId) {
        return res.status(404).json({ msg: 'orderProduct Not Found!' });
    }

    try {
        const orderProduct = await OrderProduct.findById(orderProductId).populate('OrderId', 'Title TotalAmount DiscountAmount trackCode -_id').populate('ProductId', 'ProductName ProductDescription  UnitPrice -_id');

        if (!orderProduct) {
            return res.json([]);
        }

        res.json(orderProduct, '-__v');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});


router.post('/', async (req, res) => {
    const { OrderId, ProductId, Quantity } = req.body;

    try {
        const orderProduct = await OrderProduct.create({ OrderId, ProductId, Quantity });
        const updateAmount = await calculateOrderTotal(OrderId);

        res.status(201).json({ orderProduct, updateAmount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/order/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { orderProducts } = req.body;

    if (!orderId || !Array.isArray(orderProducts)) {
        return res.status(400).json({ msg: 'Invalid data!' });
    }

    try {
        await OrderProduct.deleteMany({ OrderId: orderId });
        const newOrderProducts = orderProducts.map(op => ({
            OrderId: orderId,
            ProductId: op.ProductId,
            Quantity: op.Quantity,
            UnitPriceAtOrder: op.UnitPriceAtOrder
        }));

        const opCreated = await OrderProduct.insertMany(newOrderProducts);

        res.status(200).json({
            msg: 'OrderProducts updated successfully!',
            orderProducts: opCreated
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.put('/:id', authObjectId, async (req, res) => {
    const orderProductId = req.params.id;
    if (!orderProductId) {
        return res.status(404).json({ msg: 'orderProduct Not Found!' });
    }

    try {
        const updateOrderProduct = await OrderProduct.findByIdAndUpdate(orderProductId, req.body, { new: true });
        res.status(200).json({ msg: 'orderProduct updated successfully!', updateOrderProduct });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authObjectId, async (req, res) => {
    const orderProductId = req.params.id;
    if (!orderProductId) {
        return res.status(404).json({ msg: 'orderProduct Not Found!' });
    }

    try {
        const deletedOrderProduct = await OrderProduct.findByIdAndDelete(orderProductId, req.body, { new: true });
        res.status(200).json({ msg: 'orderProduct deleted successfully!', deletedOrderProduct });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;