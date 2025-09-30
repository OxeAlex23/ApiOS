import express from 'express';
const router = express.Router();
import OrderService from '../models/OrderServiceSchema.js';
import authObjectId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    const orderServices = await OrderService.find();
    if (!orderServices) {
        return res.json([]);
    }
    res.json(orderServices);
});

router.get('/orderByOrderService/:orderId', async (req, res) => {
    const { orderId } = req.params;
    if (!orderId) {
        return res.status(404).json({ msg: 'Order Not Found!' });
    }

    try {
        const ordersService = await OrderService.find({ OrderId: orderId });
        if (!ordersService) {
            return res.json([]);
        }
        res.status(200).json(ordersService);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/:id', authObjectId, async (req, res) => {
    const orderServiceId = req.params.id;
    if (!orderServiceId) {
        return res.status(404).json({ msg: 'orderService Not Found!' });
    }

    try {
        const orderService = await OrderService.findById(orderServiceId);
        if (!orderService) {
            return res.json([]);
        }
        res.json(orderService);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});

router.post('/', async (req, res) => {
    try {
        const orderService = await OrderService.create(req.body);
        res.status(200).json({ msg: 'orderProduct created successfully!', orderService });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.put('/order/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { orderService } = req.body;

    if (!orderId || !Array.isArray(orderService)) {
        return res.status(400).json({ msg: 'Invalid data!' });
    }

    try {
        await OrderService.deleteMany({ OrderId: orderId });
        const newOrderService = orderService.map(op => ({
            OrderId: orderId,
            ServiceId: op.ServiceId,
            Quantity: op.Quantity,
            UnitPriceAtOrder: op.UnitPriceAtOrder
        }));

        const opCreated = await OrderService.insertMany(newOrderService);

        res.status(200).json({
            msg: 'OrderService updated successfully!',
            orderService: opCreated
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', authObjectId, async (req, res) => {
    const orderServiceId = req.params.id;
    if (!orderServiceId) {
        return res.status(404).json({ msg: 'orderProduct Not Found!' });
    }

    try {
        const updateOrderService = await OrderService.findByIdAndUpdate(orderServiceId, req.body, { new: true });
        res.status(200).json({ msg: 'orderProduct updated successfully!', updateOrderService });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authObjectId, async (req, res) => {
    const orderServiceId = req.params.id;
    if (!orderServiceId) {
        return res.status(404).json({ msg: 'orderProduct Not Found!' });
    }

    try {
        const deletedOrderService = await OrderService.findByIdAndDelete(orderServiceId);
        res.status(200).json({ msg: 'orderProduct deleted successfully!', deletedOrderService });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


export default router;