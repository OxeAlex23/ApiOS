import express from 'express';
const router = express.Router();
import UserType from '../models/UserTypeSchema.js';
import authObjectId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    const usersTypes = await UserType.find();
    res.json(usersTypes);
});

router.get('/:id', authObjectId , async (req, res) => {
    const userTypeId = req.params.id;
    if (!userTypeId) {
        return res.status(404).json({msg: 'userType Not Found!'});
    }

    try {
        const userType = await UserType.findById(userTypeId);
        res.json(userType);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

router.post('/', async (req, res) => {
    try {
        const userType = await UserType.create(req.body);
        res.status(200).json({msg: 'userType created successfully!', userType});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
})

router.put('/:id', authObjectId , async (req, res) => {
    const userTypeId = req.params.id;
    if (!userTypeId) {
        return res.status(404).json({msg: 'userType Not Found!'});
    }

    try {
        const updateUserType = await UserType.findByIdAndUpdate(userTypeId, req.body, {new: true});
        res.json({msg: 'userType updated successfully' , updateUserType});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

router.delete('/:id', authObjectId , async (req, res) => {
    const userTypeId = req.params.id;
    if (!userTypeId) {
        return res.status(404).json({msg: 'userType Not Found!'});
    }

    try {
        const deletedUserType = await UserType.findByIdAndDelete(userTypeId);
        res.json({msg: 'userType deleted successfully!' , deletedUserType});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

export default router;
