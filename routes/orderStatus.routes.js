import express from 'express';
const router = express.Router();
import OrderStatus from '../models/OrderStatusSchema.js';
import authObjectId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    const orderStatus = await OrderStatus.find();
    res.json(orderStatus);
})

router.get('/:id', authObjectId, async (req, res) => {
    const orderStatusId = req.params.id;
    if (!orderStatusId) {
        return res.status(404).json({ msg: 'status de pedido não encontrado!' });
    }

    try {
        const orderStatus = await OrderStatus.findById(orderStatusId);
        res.json(orderStatus);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }

});

router.post('/', async (req, res) => {
    try {
        const orderStatus = await OrderStatus.create(req.body);
        res.status(200).json({msg: 'status de pedido criado com sucesso!', orderStatus});
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }

});

router.put('/:id', authObjectId, async (req, res) => {
    const orderStatusId = req.params.id;
    if (!orderStatusId) {
        return res.status(404).json({ msg: 'status de pedido não encontrado!' });
    }

    try {
        const orderStatus = await OrderStatus.findByIdAndUpdate(orderStatusId, req.body, {new: true});
        res.status(200).json({msg: 'status de pedido atualizado com sucesso!', orderStatus});
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }

});

router.put('/:id', authObjectId, async (req, res) => {
    const orderStatusId = req.params.id;
    if (!orderStatusId) {
        return res.status(404).json({ msg: 'status de pedido não encontrado!' });
    }

    try {
        const deletedOrderStatus = await OrderStatus.findByIdAndDelete(orderStatusId);
        res.status(200).json({msg: 'status de pedido deletado com sucesso!', deletedOrderStatus});
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }

});

export default router;