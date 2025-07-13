import express from 'express';
const router = express.Router();
import ProductCategory from '../models/ProductCategorySchema.js';
import authObjectId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    const productsCategory = await ProductCategory.find();
    res.json(productsCategory);
});

router.get('/:id', authObjectId, async (req, res) => {
    const productCategoryId = req.params.id;
    if (!productCategoryId) {
        return res.status(404).json({ msg: 'categoria de produto não encontrada!' });
    }

    try {
        const productCategory = await ProductCategory.findById(productCategoryId).populate('BusinessId');
        res.json(productCategory);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.get('/categoryBybusiness/:businessId', async (req, res) => {
    const { businessId } = req.params;

    try {
        const categories = await ProductCategory.find({ BusinessId: businessId });

        if (!categories || categories.length === 0) {
            return res.status(404).json({ msg: 'Nenhuma categoria de produto encontrada para este business.' });
        }

        res.json(categories);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});


router.post('/', async (req, res) => {
    try {
        const productCategory = await ProductCategory.create(req.body);
        res.status(200).json({ msg: 'categoria de produto criada com sucesso!', productCategory });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.put('/:id', authObjectId, async (req, res) => {
    const productCategoryId = req.params.id;
    if (!productCategoryId) {
        return res.status(404).json({ msg: 'categoria de produto não encontrada!' });
    }

    try {
        const updateProductCategory = await ProductCategory.findByIdAndUpdate(productCategoryId, req.body, { new: true });
        res.status(200).json({ msg: 'categoria de produto atualizada com sucesso!', updateProductCategory });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.delete('/:id', authObjectId, async (req, res) => {
    const productCategoryId = req.params.id;
    if (!productCategoryId) {
        return res.status(404).json({ msg: 'categoria de produto não encontrada!' });
    }

    try {
        const deletedProductCategory = await ProductCategory.findByIdAndDelete(productCategoryId, req.body, { new: true });
        res.status(200).json({ msg: 'categoria de produto deletada com sucesso!', deletedProductCategory });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

export default router;