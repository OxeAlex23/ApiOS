import express from 'express';
const router = express.Router();
import Customer from '../models/CustomerSchema.js';
import Business from '../models/BusinessSchema.js';
import authObjectId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    try {
        const Customers = await Customer.find();
        if (!Customers) {
            return res.json([]);
        }
        res.json(Customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});

router.get('/customersByBusiness/:businessId', async (req, res) => {
    const { businessId } = req.params;

    try {
        if (!businessId) {
            return res.status(404).json({ msg: 'business Not Found! ' });
        }

        const customers = await Customer.find({ BusinessId: businessId }).populate('BusinessId', 'BusinessName');
        if (!customers) {
            return res.json([]);
        }
        res.status(202).json(customers);

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

router.get('/:id', authObjectId, async (req, res) => {
    const customerId = req.params.id;
    if (!customerId) {
        return res.status(404).json({ msg: 'customer Not Found!' });
    }

    try {
        const customer = await Customer.findById(customerId).populate('BusinessId', 'BusinessName -_id');
        if (!customer) {
            return res.json([]);
        }
        res.json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});

router.post('/', async (req, res) => {

    try {
        const customer = await Customer.create(req.body);
        res.status(200).json({ msg: 'customer created  successfully!', customer });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', authObjectId, async (req, res) => {
    const customerId = req.params.id;
    if (!customerId) {
        return res.status(404).json({ msg: 'customer Not Found!' });
    }

    try {
        const updateCustomer = await Customer.findByIdAndUpdate(customerId, req.body, { new: true });
        res.status(200).json({ msg: 'customer updated successfully!', updateCustomer });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authObjectId, async (req, res) => {
    const customerId = req.params.id;
    if (!customerId) {
        return res.status(404).json({ msg: 'customer Not Found!' });
    }

    try {
        const deletedCustomer = await Customer.findByIdAndDelete(customerId);
        res.status(200).json({ msg: 'customer deleted successfully!', deletedCustomer });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
