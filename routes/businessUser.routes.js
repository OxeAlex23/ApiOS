import express from 'express';
const router = express.Router();
import BusinessUser from '../models/BusinessUserSchema.js';
import authObjectId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    const businessUsers = await BusinessUser.find();
    res.json(businessUsers);
});

router.get('/:id', authObjectId, async (req, res) => {
    const businessUserId = req.params.id;
    if (!businessUserId) {
        return res.status(404).json({ msg: 'businessUser Not Found!' });
    }

    try {
        const businessUser = await BusinessUser.findById(businessUserId).populate('UserId', 'FirstName LastName -_id')
            .populate('BusinessId', 'BusinessName -_id');
        res.json(businessUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});

router.get('/businessesByUser/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const businesses = await BusinessUser.find({ UserId: userId })
      .populate('BusinessId', 'BusinessName -_id');
    res.json(businesses.map(b => ({BusinessId: b.BusinessId})))   

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/usersByBusiness/:businessId', async (req, res) => {
  try {
    const businessId = req.params.businessId;

    const users = await BusinessUser.find({ BusinessId: businessId })
      .populate('UserId', '-_id ');
    res.json(users.map(u => ({UserId: u.UserId}))) 

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
    const {UserId, BusinessId} = req.body;
    try {
        const businessUser = await BusinessUser.create({UserId, BusinessId});
        res.status(200).json({msg: 'businessUser created successfully!' , businessUser});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});

router.put('/:id', authObjectId, async (req, res) => {
    const businessUserId = req.params.id;
    if (!businessUserId) {
        return res.status(404).json({ msg: 'businessUser Not Found!' });
    }

    try {
        const updateBusinessUser = await BusinessUser.findByIdAndUpdate(businessUserId, req.body, {new: true});
        res.status(200).json({msg: 'businessUser updated successfully!' , updateBusinessUser});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});

router.delete('/:id', authObjectId, async (req, res) => {
    const businessUserId = req.params.id;
    if (!businessUserId) {
        return res.status(404).json({ msg: 'businessUser Not Found!' });
    }

    try {
        const deletedBusinessUser = await BusinessUser.findByIdAndDelete(businessUserId);
        res.status(200).json({msg: 'businessUser deleted successfully!' , deletedBusinessUser});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});

export default router;