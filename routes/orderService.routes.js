import express from 'express';
const router = express.Router();
import OrderServiceSchema from '../models/OrderServiceSchema.js';
import authObjectId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    const orderServices = await OrderServiceSchema.find();
    res.json(orderServices);
});

router.get('/:id', authObjectId, async (req, res) => {
    const orderServiceId = req.params.id;
    if (!orderServiceId) {
        return res.status(404).json({ msg: 'serviço de pedidos não encontrado!' });
    }

    try {
        const orderService = await OrderServiceSchema.findById(orderServiceId);
        res.json(orderService);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }

});

router.post('/', async (req, res) => {
    try {
        const orderService = await OrderServiceSchema.create(req.body);
        res.status(200).json({msg: 'serviço de pedidos criado com sucesso!', orderService});
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.put('/:id', authObjectId , async (req, res) => {
    const orderServiceId = req.params.id;
    if (!orderServiceId) {
        return res.status(404).json({ msg: 'serviço de pedidos não encontrado!' });
    }

    try {
        const updateOrderService = await OrderServiceSchema.findByIdAndUpdate(orderServiceId, req.body, {new: true});
        res.status(200).json({msg: 'serviço de pedidos atualizado com sucesso!', updateOrderService});
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.delete('/:id', authObjectId , async (req, res) => {
    const orderServiceId = req.params.id;
    if (!orderServiceId) {
        return res.status(404).json({ msg: 'serviço de pedidos não encontrado!' });
    }

    try {
        const deletedOrderService = await OrderServiceSchema.findByIdAndDelete(orderServiceId);
        res.status(200).json({msg: 'serviço de pedidos deletado com sucesso!', deletedOrderService});
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});


export default router;