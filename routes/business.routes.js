import express from 'express';
const router = express.Router();
import BusinessSchema from '../models/BusinessSchema.js';
import authObejctId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    const business = await BusinessSchema.find();
    res.json(business);
});

router.get('/:id', authObejctId, async (req, res) => {
    const businessId = req.params.id;

    if (!businessId) {
        return res.status(404).json({ msg: 'businessId não encontrado!' })
    }
    const business = await BusinessSchema.find();
    res.json(business);
});

router.post('/', async (req, res) => {
    try {
        const businessUser = await BusinessSchema.create(req.body);
        res.status(200).json({ msg: 'businessUser criado com sucesso!', businessUser });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.put('/:id', authObejctId, async (req, res) => {
    const businessUserId = req.params.id;

    if (!businessUserId) {
        return res.status(404).json({ msg: 'usuario business não encontrado!', businessUserId });
    }

    try {
        const updateBusinessUser = await BusinessSchema.findByIdAndUpdate(businessUserId, req.body, {new: true});
        res.status(200).json({msg: 'usuario business atualizado com sucesso!', updateBusinessUser})
    } catch (err) {
        res.status(500).json({erro: err.message})
    }
});

router.delete('/:id', authObejctId , async (req, res) => {
    const businessUserId = req.params.id;

    if (!businessUserId) {
        return res.status(404).json({msg: 'usuário business não encontrado!'});
    }

    try {
        const deleteBusinessUser =  await BusinessSchema.findByIdAndDelete(businessUserId);
        res.status(200).json({msg: 'usuário business deletado com sucesso!', deleteBusinessUser});
    } catch (err) {
        res.status(500).json({erro: err.message});
    }
})
export default router;