import express from 'express';
const router = express.Router();
import UserTypeSchema from '../models/UserTypeSchema.js';
import authObjectId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    const usersTypes = await UserTypeSchema.find();
    res.json(usersTypes);
});

router.get('/:id', authObjectId , async (req, res) => {
    const userTypeId = req.params.id;
    if (!userTypeId) {
        return res.status(404).json({msg: 'tipo de usuário não encontrado!'});
    }

    try {
        const userType = await UserTypeSchema.findById(userTypeId);
        res.json(userType);
    } catch (err) {
        res.status(500).json({erro: err.message});
    }
});

router.post('/', async (req, res) => {
    try {
        const userType = await UserTypeSchema.create(req.body);
        res.status(200).json({msg: 'tipo de usuário criado com sucesso!', userType});
    } catch (err) {
        res.status(500).json({erro: err.message});
    }
})

router.put('/:id', authObjectId , async (req, res) => {
    const userTypeId = req.params.id;
    if (!userTypeId) {
        return res.status(404).json({msg: 'tipo de usuário não encontrado!'});
    }

    try {
        const updateUserType = await UserTypeSchema.findByIdAndUpdate(userTypeId, req.body, {new: true});
        res.json({msg: 'tipo de usuário atualizado com sucesso!' , updateUserType});
    } catch (err) {
        res.status(500).json({erro: err.message});
    }
});

router.delete('/:id', authObjectId , async (req, res) => {
    const userTypeId = req.params.id;
    if (!userTypeId) {
        return res.status(404).json({msg: 'tipo de usuário não encontrado!'});
    }

    try {
        const deletedUserType = await UserTypeSchema.findByIdAndDelete(userTypeId);
        res.json({msg: 'tipo de usuário deletado com sucesso!' , deletedUserType});
    } catch (err) {
        res.status(500).json({erro: err.message});
    }
});

export default router;
