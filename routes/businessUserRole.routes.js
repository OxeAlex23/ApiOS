import express from 'express';
const router = express.Router();
import BusinessUserRole from '../models/BusinessUserRoleSchema.js';
import authObjectId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    const businessUsersRole = await BusinessUserRole.find();
    res.json(businessUsersRole);
});

router.get('/:id', authObjectId, async (req, res) => {
    const businessUserRoleId = req.params.id;
    if (!businessUserRoleId) {
        return res.status(404).json({ msg: 'businessUserRole Not Found!' })
    }

    try {
        const businessUserRole = await BusinessUserRole.findById(businessUserRoleId);
        res.json(businessUserRole);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

});

router.post('/', async (req, res) => {
    try {
        const businessUserRole = await BusinessUserRole.create(req.body);
        res.status(200).json({msg: 'businessUserRole created  successfully!' ,businessUserRole});
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

});

router.put('/:id', authObjectId, async (req, res) => {
    const businessUserRoleId = req.params.id;
    if (!businessUserRoleId) {
        return res.status(404).json({ msg: 'businessUserRole Not Found!' })
    }

    try {
        const updateBusinessUserRole = await BusinessUserRole.findByIdAndUpdate(businessUserRoleId, req.body, {new: true});
        res.status(200).json({msg: 'businessUserRole updated successfully!', updateBusinessUserRole});
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

});

router.delete('/:id', authObjectId, async (req, res) => {
    const businessUserRoleId = req.params.id;
    if (!businessUserRoleId) {
        return res.status(404).json({ msg: 'businessUserRole Not Found!' })
    }

    try {
        const deletedBusinessUserRole = await BusinessUserRole.findByIdAndDelete(businessUserRoleId);
        res.status(200).json({msg: 'businessUserRole deleted successfully!', deletedBusinessUserRole});
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

});



export default router;
