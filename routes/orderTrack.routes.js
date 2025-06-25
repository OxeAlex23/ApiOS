import express from 'express';
const router = express.Router();
import OrderTrackSchema from '../models/OrderTrackSchema.js';
import authObjectId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    const orderstracks = await OrderTrackSchema.find();
    res.json(orderstracks);
});

router.get('/:id', authObjectId, async (req, res) => {
    const orderTrackId = req.params.id;
    if (!orderTrackId) {
        return res.status(404).json({ msg: 'id de acompanhamento de pedidos não encontrado!' });
    }

    try {
        const ordertrack = await OrderTrackSchema.findById(orderTrackId);
        res.json(ordertrack);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }

});

router.post('/', async (req, res) => {
    try {
        const ordertrack = await OrderTrackSchema.create(req.body);
        res.status(200).json({msg: 'acompanhamento de pedidos criado com sucesso!', ordertrack})
    } catch (err) {
        res.status(500).json({ erro: err.message })
    }
});

router.put('/:id', authObjectId , async (req, res) => {
    const orderTrackId = req.params.id;
    if (!orderTrackId) {
        return res.status(404).json({ msg: 'id de acompanhamento de pedidos não encontrado!' });
    }

    try {
        const updatedOrderTrack = await OrderTrackSchema.findByIdAndUpdate(orderTrackId, req.body, {new: true});
        res.status(200).json({msg: 'acompanhamento de pedidos atualizado com sucesso!', updatedOrderTrack});
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.delete('/:id', authObjectId , async (req, res) => {
    const orderTrackId = req.params.id;
    if (!orderTrackId) {
        return res.status(404).json({ msg: 'id de acompanhamento de pedidos não encontrado!' });
    }

    try {
        const deletedOrderTrack = await OrderTrackSchema.findByIdAndDelete(orderTrackId);
        res.status(200).json({msg: ' acompanhamento de pedidos deletado com sucesso!', deletedOrderTrack});
    } catch (err) {
       res.status(500).json({ erro: err.message });
    }
})

export default router;