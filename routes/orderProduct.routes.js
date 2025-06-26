import express from 'express';
const router = express.Router();
import OrderProductSchema from '../models/OrderProductSchema.js';
import authObjectId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    const orderProducts = await OrderProductSchema.find();
    res.json(orderProducts);
});

router.get('/:id', authObjectId, async (req, res) => {
    const orderProductId = req.params.id;
    if (!orderProductId) {
        return res.status(404).json({ msg: 'encomenda de produto não encontrado!' });
    }

    try {
        const orderProduct = await OrderProductSchema.findById(orderProductId);
        res.json(orderProduct);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }

});

router.post('/', async (req, res) => {
    try {
        const orderProduct = await OrderProductSchema.create(req.body);
        res.status(200).json({msg: 'encomenda de produto criada com sucesso!', orderProduct});
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.put('/:id', authObjectId , async (req, res) => {
    const orderProductId = req.params.id;
    if (!orderProductId) {
        return res.status(404).json({ msg: 'encomenda de produto não encontrado!' });
    }

    try {
        const updateorderProduct = await OrderProductSchema.findByIdAndUpdate(orderProductId, req.body, {new: true});
        res.status(200).json({msg: 'encomenda atualizada com sucesso!', updateorderProduct});
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.delete('/:id', authObjectId , async (req, res) => {
    const orderProductId = req.params.id;
    if (!orderProductId) {
        return res.status(404).json({ msg: 'encomenda de produto não encontrado!' });
    }

    try {
        const deletedOrderProduct = await OrderProductSchema.findByIdAndDelete(orderProductId, req.body, {new: true});
        res.status(200).json({msg: 'encomenda deletada com sucesso!', deletedOrderProduct});
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

export default router;