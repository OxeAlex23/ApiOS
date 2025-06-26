import express from 'express';
const router = express.Router();
import BusinessUserSchema from '../models/BusinessUserSchema.js';
import authObjectId from '../middleware/authObjectId.js'

router.get('/', async (req, res) => {
    const businessUsers = await BusinessUserSchema.find();
    res.json(businessUsers);
});

router.get('/:id', authObjectId, async (req, res) => {
    const businessUserId = req.params.id;
    if (!businessUserId) {
        return res.status(404).json({ msg: 'usuário business não encontrado!' });
    }

    try {
        const businessUser = await BusinessUserSchema.findById(businessUserId);
        res.json(businessUser);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }

});

router.post('/', async (req, res) => {
    try {
        const businessUser = await BusinessUserSchema.create(req.body);
        res.status(200).json({msg: 'usuário business criado com sucesso!' , businessUser});
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }

});

router.put('/:id', authObjectId, async (req, res) => {
    const businessUserId = req.params.id;
    if (!businessUserId) {
        return res.status(404).json({ msg: 'usuário business não encontrado!' });
    }

    try {
        const updateBusinessUser = await BusinessUserSchema.findByIdAndUpdate(businessUserId, req.body, {new: true});
        res.status(200).json({msg: 'usuário business atualizado com sucesso!' , updateBusinessUser});
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }

});

router.put('/:id', authObjectId, async (req, res) => {
    const businessUserId = req.params.id;
    if (!businessUserId) {
        return res.status(404).json({ msg: 'usuário business não encontrado!' });
    }

    try {
        const deletedBusinessUser = await BusinessUserSchema.findByIdAndDelete(businessUserId);
        res.status(200).json({msg: 'usuário business deletado com sucesso!' , deletedBusinessUser});
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }

});

export default router;