import express from 'express';
const router = express.Router();
import OrderProduct from '../models/OrderProductSchema.js';
import authObjectId from '../middleware/authObjectId.js';
import { calculateOrderTotal } from './calculateOrderTotal.js';

router.get('/', async (req, res) => {
    const orderProducts = await OrderProduct.find();
    res.json(orderProducts);
});

router.get('/:id', authObjectId, async (req, res) => {
    const orderProductId = req.params.id;
    if (!orderProductId) {
        return res.status(404).json({ msg: 'encomenda de produto não encontrado!' });
    }

    try {
        const orderProduct = await OrderProduct.findById(orderProductId).populate('OrderId', '-__v').populate('ProductId', '-__v');
        res.json(orderProduct);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }

});

router.post('/', async (req, res) => {
    try {
        const orderProduct = await OrderProduct.create(req.body);
        res.status(200).json({msg: 'encomenda de produto criada com sucesso!', orderProduct});
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.post('/order-product', async (req, res) => {
    const {OrderId, ProductId, Quantity } = req.body;

    try {
        const orderProduct = await OrderProduct.create({OrderId, ProductId, Quantity});
        const updateAmout = await calculateOrderTotal(OrderId);
        res.status(201).json({ orderProduct, updateAmout  });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', authObjectId , async (req, res) => {
    const orderProductId = req.params.id;
    if (!orderProductId) {
        return res.status(404).json({ msg: 'encomenda de produto não encontrado!' });
    }

    try {
        const updateorderProduct = await OrderProduct.findByIdAndUpdate(orderProductId, req.body, {new: true});
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
        const deletedOrderProduct = await OrderProduct.findByIdAndDelete(orderProductId, req.body, {new: true});
        res.status(200).json({msg: 'encomenda deletada com sucesso!', deletedOrderProduct});
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

export default router;