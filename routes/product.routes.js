import express from 'express';
const router = express.Router();
import Product from '../models/ProductSchema.js';
import authObjectId from '../middleware/authObjectId.js';

router.post('/', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(200).json({msg: 'produdo criado com sucesso!', product });
    } catch (err) {
        res.status(400).json({err: err.message});
    }
})

router.get('/', async (req, res) => {
    const products = await Product.find();
    res.json(products);
})

router.get('/:id', authObjectId ,async (req, res) => {
    const productId = req.params.id;

    try {
        const productFound = await Product.findById(productId).populate('ProductCategoryId').populate('BusinessId');
        if (!productFound) {
            return res.status(404).json({ msg: 'produto não encontrado!' });
        }

        res.json(productFound);
    } catch (err) {
        res.status(400).json({erro: err.message});
    }
});

router.put('/:id', authObjectId ,async (req, res) => {
    const productId = req.params.id;

    try {
        const updateProduct = await Product.findByIdAndUpdate(productId, req.body, {new:  true});
        if (!updateProduct) {
            return res.status(404).json({ msg: 'produto não encontrado' });
        }

        res.json(updateProduct);
    } catch (err) {
        res.status(400).json({erro: err.message});
    }
});

router.delete('/:id', authObjectId ,async (req, res) => {
    const productDeleted = await Product.findByIdAndDelete(req.params.id);

    if (!productDeleted) {
        return res.status(404).json({msg: 'produto não encontrado!'});
    }

    res.status(200).json({msg: 'produto deletado com sucesso!', productDeleted});
});

export default router;