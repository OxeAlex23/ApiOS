import express from 'express';
const router = express.Router();
import ProductCategory from '../models/ProductCategorySchema.js';
import authObjectId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    const productsCategory = await ProductCategory.find();
    if (!productsCategory) {
        return res.json([]);
    }
    res.json(productsCategory);
});

router.get('/:id', authObjectId, async (req, res) => {
    const productCategoryId = req.params.id;
    if (!productCategoryId) {
        return res.status(404).json({ msg: 'productCategory Not Found!' });
    }

    try {
        const productCategory = await ProductCategory.findById(productCategoryId);
        if (!productCategory) {
            return res.json([]);
        }
        res.json(productCategory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/categoryByBusiness/:businessId', async (req, res) => {
    const { businessId } = req.params;

    try {
        const categories = await ProductCategory.find({ BusinessId: businessId }).populate('BusinessId', 'BusinessName');

        if (!categories || categories.length === 0) {
            return res.json([]);
        }

        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/', async (req, res) => {
    try {
        const productCategory = await ProductCategory.create(req.body);
        res.status(200).json({ msg: 'ProductCategory created successfully!', productCategory });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', authObjectId, async (req, res) => {
    const productCategoryId = req.params.id;
    if (!productCategoryId) {
        return res.status(404).json({ msg: 'ProductCategory Not Found!' });
    }

    try {
        const updateProductCategory = await ProductCategory.findByIdAndUpdate(productCategoryId, req.body, { new: true });
        res.status(200).json({ msg: 'ProductCategory updated successfully!', updateProductCategory });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authObjectId, async (req, res) => {
    const productCategoryId = req.params.id;
    if (!productCategoryId) {
        return res.status(404).json({ msg: 'ProductCategory Not Found!' });
    }

    try {
        const deletedProductCategory = await ProductCategory.findByIdAndDelete(productCategoryId, req.body, { new: true });
        res.status(200).json({ msg: 'ProductCategory deleted successfully!', deletedProductCategory });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;