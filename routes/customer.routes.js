import express from 'express';
const router = express.Router();
import CustomerSchema from '../models/CustomerSchema.js';
import authObjectId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    const Customers = await CustomerSchema.find();
    res.json(Customers);
});

router.get('/:id', authObjectId , async (req, res) => {
    const customerId = req.params.id;
    if (!customerId) {
        return res.status(404).json({msg: 'customer não encontrado!'});
    }

    try {
        const customer = await CustomerSchema.findById(customerId);
        res.json(customer);
    } catch (err) {
        res.status(500).json({erro: err.message});
    }

});

router.post('/', async (req, res) => {
    try {
        const customer = await CustomerSchema.create(req.body);
        res.status(200).json({msg: 'customer criado com sucesso!', customer});
    } catch (err) {
        res.status(500).json({erro: err.message}); 
    }
});

router.put('/:id', authObjectId , async (req, res) => {
    const customerId = req.params.id;
     if (!customerId) {
        return res.status(404).json({msg: 'customer não encontrado!'});
    }

    try {
        const updateCustomer = await CustomerSchema.findByIdAndUpdate(customerId, req.body, {new: true});
        res.status(200).json({msg: 'customer atualizado com sucesso!', updateCustomer});
    } catch (err) {
        res.status(500).json({erro: err.message});
    }
});

router.delete('/:id', authObjectId , async (req, res) => {
    const customerId = req.params.id;
     if (!customerId) {
        return res.status(404).json({msg: 'customer não encontrado!'});
    }

    try {
        const deletedCustomer = await CustomerSchema.findByIdAndDelete(customerId);
        res.status(200).json({msg: 'customer deletado com sucesso!', deletedCustomer});
    } catch (err) {
        res.status(500).json({erro: err.message});
    }
});

export default router;
