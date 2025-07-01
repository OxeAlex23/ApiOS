import express from 'express';
const router = express.Router();
import BusinessUser from '../models/BusinessUserSchema.js';
import authObjectId from '../middleware/authObjectId.js'

router.get('/', async (req, res) => {
    const businessUsers = await BusinessUser.find();
    res.json(businessUsers);
});

router.get('/:id', authObjectId, async (req, res) => {
    const businessUserId = req.params.id;
    if (!businessUserId) {
        return res.status(404).json({ msg: 'usuário business não encontrado!' });
    }

    try {
        const businessUser = await BusinessUser.findById(businessUserId);
        res.json(businessUser);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }

});

router.post('/', async (req, res) => {
    try {
        const businessUser = await BusinessUser.create(req.body);
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
        const updateBusinessUser = await BusinessUser.findByIdAndUpdate(businessUserId, req.body, {new: true});
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
        const deletedBusinessUser = await BusinessUser.findByIdAndDelete(businessUserId);
        res.status(200).json({msg: 'usuário business deletado com sucesso!' , deletedBusinessUser});
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }

});

export default router;