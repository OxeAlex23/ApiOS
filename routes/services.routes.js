import express from 'express';
const router = express.Router();
import ServicesSchema from '../models/ServicesSchema.js';
import authObjectId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    const services = await ServicesSchema.find();
    res.json(services);
});

router.get('/:id', authObjectId, async (req, res) => {
    const serviceId = req.params.id;
    if (!serviceId) {
        return res.status(404).json({ msg: 'serviço não encontrado!' });
    }

    try {
        const service = await ServicesSchema.findById(serviceId);
        res.json(service);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }

});

router.post('/', async (req, res) => {
    try {
        const service = await ServicesSchema.create(req.body);
        res.status(200).json({msg: 'serviço criado com sucesso!', service});
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.put('/:id', authObjectId , async (req, res) => {
    const serviceId = req.params.id;
     if (!serviceId) {
        return res.status(404).json({ msg: 'serviço não encontrado!' });
    }

    try {
        const updateService = await ServicesSchema.findByIdAndUpdate(serviceId, req.body, {new: true});
        res.status(200).json({msg: 'serviço atualizado com sucesso!', updateService});
    } catch (err) {
         res.status(500).json({ erro: err.message });
    }
});

router.delete('/:id', authObjectId , async (req, res) => {
    const serviceId = req.params.id;
     if (!serviceId) {
        return res.status(404).json({ msg: 'serviço não encontrado!' });
    }

    try {
        const deletedService = await ServicesSchema.findByIdAndDelete(serviceId);
        res.status(200).json({msg: 'serviço deletado com sucesso!', deletedService});
    } catch (err) {
         res.status(500).json({ erro: err.message });
    }
})

export default router;