import express from 'express';
const router = express.Router();
import BusinessUser from '../models/BusinessUserSchema.js';
import authObjectId from '../middleware/authObjectId.js';
import mongoose from 'mongoose';

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

router.get('/debug/business-users', async (req, res) => {
  try {
    const all = await BusinessUser.find().populate('BusinessId');
    res.json(all);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});


router.get('/businessUserId/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const businessUser = await BusinessUser.find({
      UserId: userId // funciona porque está salvo como string
    }).populate('BusinessId');

    res.json(businessUser);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.get('/byBusinessId/:businessId', async (req, res) => {
  try {
    const businessId = req.params.businessId;

    const users = await BusinessUser.find({
      BusinessId: businessId
    }).populate('UserId');

    res.json(users);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.get('/businessesByUser/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const businesses = await BusinessUser.find({ UserId: userId })
      .populate('BusinessId');

    res.json(businesses);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.get('/usersByBusiness/:businessId', async (req, res) => {
  try {
    const businessId = req.params.businessId;

    const users = await BusinessUser.find({ BusinessId: businessId })
      .populate('UserId');

    res.json(users);
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