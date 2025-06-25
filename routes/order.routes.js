import express from 'express';
const router = express.Router();
import OrderSchema from '../models/OrderSchema.js';
import authObjectId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    const orders = await OrderSchema.find();
    res.json(orders);
});

router.get('/:id', authObjectId , async (req, res) => {
    const orderId = req.params.id;
    if (!orderId) {
        return res.status(404).json({msg: 'ordem não encontrada!'})
    }

    const orders = await OrderSchema.findById(orderId);
    res.json(orders);
});

router.post('/', async (req, res) => {
    try {
        const order = await OrderSchema.create(req.body);
        res.status(200).json({msg: 'ordem criada com sucesso!', order});
    } catch (err) {
        res.status(500).json({erro: err.message});
    }
});

router.put('/:id', authObjectId , async (req, res) => {
    const orderId = req.params.id;
    if (!orderId) {
        return res.status(404).json({msg: 'ordem não encontrada!'});
    }

    try {
        const updateOrder = await OrderSchema.findByIdAndUpdate(orderId, req.body, {new: true});
        res.status(200).json({msg: 'ordem atualizada com sucesso!', updateOrder});
    } catch (err) {
        res.status(500).json({erro: err.message});
    }
});

router.delete('/:id', authObjectId , async (req, res) => {
    const orderId = req.params.id;
    if (!orderId) {
        return res.status(404).json({msg: 'ordem não encontrada!'});
    }

    try {
        const deletedOrder = await OrderSchema.findByIdAndDelete(orderId);
        res.status(200).json({msg: 'ordem deletada com sucesso!', deletedOrder});
    } catch (err) {
        res.status(500).json({erro: err.message});
    }
});

export default router;


