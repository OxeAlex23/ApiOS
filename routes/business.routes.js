import express from 'express';
const router = express.Router();
import Business from '../models/BusinessSchema.js';
import authObjectId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    const business = await Business.find();
    res.json(business);
});

router.get('/:id', authObjectId, async (req, res) => {
    const businessId = req.params.id;
   

    if (!businessId) {
        return res.status(404).json({ msg: 'businessId não encontrado!' })
    }
    const business = await Business.find().populate('UserId', 'FirstName LastName -_id');
    res.json(business);
});


router.post('/', async (req, res) => {
    try {
        const businessUser = await Business.create(req.body);
        res.status(200).json({ msg: 'businessUser criado com sucesso!', businessUser });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.put('/:id', authObjectId, async (req, res) => {
    const businessUserId = req.params.id;

    if (!businessUserId) {
        return res.status(404).json({ msg: 'usuario business não encontrado!', businessUserId });
    }

    try {
        const updateBusinessUser = await Business.findByIdAndUpdate(businessUserId, req.body, {new: true});
        res.status(200).json({msg: 'usuario business atualizado com sucesso!', updateBusinessUser})
    } catch (err) {
        res.status(500).json({erro: err.message})
    }
});

router.delete('/:id', authObjectId , async (req, res) => {
    const businessUserId = req.params.id;

    if (!businessUserId) {
        return res.status(404).json({msg: 'usuário business não encontrado!'});
    }

    try {
        const deleteBusinessUser =  await Business.findByIdAndDelete(businessUserId);
        res.status(200).json({msg: 'usuário business deletado com sucesso!', deleteBusinessUser});
    } catch (err) {
        res.status(500).json({erro: err.message});
    }
})
export default router;