import express from 'express';
const router = express.Router();
import OrderTrack from '../models/OrderTrackSchema.js';
import authObjectId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    const orderTracks = await OrderTrack.find();
    if (!orderTracks) {
        return res.json([]);
    }
    res.json(orderTracks);
});

router.get('/:id', authObjectId, async (req, res) => {
    const orderTrackId = req.params.id;
    if (!orderTrackId) {
        return res.status(404).json({ msg: 'orderTrack Not Found!' });
    }

    try {
        const orderTrack = await OrderTrack.findById(orderTrackId);
        if (!orderTrack) {
            return res.json([]);
        }
        res.json(orderTrack);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});

router.post('/', async (req, res) => {
    try {
        const orderTrack = await OrderTrack.create(req.body);
        res.status(200).json({ msg: 'orderTrack created successfully!', orderTrack })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

router.put('/:id', authObjectId, async (req, res) => {
    const orderTrackId = req.params.id;
    if (!orderTrackId) {
        return res.status(404).json({ msg: 'orderTrack Not Found!' });
    }

    try {
        const updatedOrderTrack = await OrderTrack.findByIdAndUpdate(orderTrackId, req.body, { new: true });
        res.status(200).json({ msg: 'orderTrack updated successfully!', updatedOrderTrack });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authObjectId, async (req, res) => {
    const orderTrackId = req.params.id;
    if (!orderTrackId) {
        return res.status(404).json({ msg: 'orderTrack Not Found!' });
    }

    try {
        const deletedOrderTrack = await OrderTrack.findByIdAndDelete(orderTrackId);
        res.status(200).json({ msg: 'orderTrack deleted successfully!', deletedOrderTrack });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

export default router;