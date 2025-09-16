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