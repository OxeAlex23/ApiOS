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
        return res.status(404).json({ msg: 'orderStatus Not Found!' });
    }

    try {
        const orderStatus = await OrderStatus.findById(orderStatusId, '-__v').populate('BusinessId', 'BusinessName -_id');
        res.json(orderStatus);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});

router.get('/statusByBusiness/:businessId', async (req, res) => {
    const businessId = req.params.businessId;

    if (!businessId) {
        return res.status(404).json([]);
    }

    try {
        const statusByBusiness = await OrderStatus.find({BusinessId: businessId}, '-__v').populate('BusinessId', 'BusinessName -_id')
        if (!statusByBusiness) {
            return res.status(404).json([]);
        }

        res.status(200).json(statusByBusiness);

    } catch (err) {
        res.status(500).json({error: err.message})
    }
})

router.post('/', async (req, res) => {
    try {
        const orderStatus = await OrderStatus.create(req.body);
        res.status(200).json({msg: 'orderStatus created successfully!', orderStatus});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});

router.put('/:id', authObjectId, async (req, res) => {
    const orderStatusId = req.params.id;

    try {
        const orderStatus = await OrderStatus.findByIdAndUpdate(orderStatusId, req.body, {new: true});
         if (!orderStatus) {
            return res.status(404).json({ msg: 'orderStatus not found!' });
        }
        res.status(200).json({msg: 'orderStatus updated successfully!', orderStatus});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});

router.delete('/:id', authObjectId, async (req, res) => {
    const orderStatusId = req.params.id;
    if (!orderStatusId) {
        return res.status(404).json({ msg: 'orderStatus Not Found' });
    }

    try {
        const deletedOrderStatus = await OrderStatus.findByIdAndDelete(orderStatusId);
        res.status(200).json({msg: 'orderStatus deleted successfully!', deletedOrderStatus});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});

export default router;