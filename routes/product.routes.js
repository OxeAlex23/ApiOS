import express from 'express';
const router = express.Router();
import ProductSchema from '../models/ProductSchema.js';
import mongoose from 'mongoose';

router.post('/', async (req, res) => {
    try {
        const product = await ProductSchema.create(req.body);
        res.status(200).json({msg: 'produdo criado com sucesso!', product });
    } catch (err) {
        res.status(400).json({err: err.message});
    }
})

router.get('/', async (req, res) => {
    const products = await ProductSchema.find();
    res.json(products);
})

router.get('/:id', async (req, res) => {
    const productId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(404).json({msg: 'produto não encontrado!'});
    }

    try {
        const productFound = await ProductSchema.findById(productId);
        if (!productFound) {
            return res.status(404).json({ msg: 'produto não encontrado!' });
        }

        res.json(productFound);
    } catch (err) {
        res.status(400).json({erro: err.message});
    }
});

router.put('/:id', async (req, res) => {
    const productId = req.params.id;

       if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(404).json({msg: 'produto não encontrado!'});
    }

    try {
        const updateProduct = await ProductSchema.findByIdAndUpdate(productId, req.body, {new:  true});
        if (!updateProduct) {
            return res.status(404).json({ msg: 'produto não encontrado' });
        }

        res.json(updateProduct);
    } catch (err) {
        res.status(400).json({erro: err.message});
    }
});

router.delete('/:id', async (req, res) => {
    const productDeleted = await ProductSchema.findByIdAndDelete(req.params.id);

    if (!productDeleted) {
        return res.status(404).json({msg: 'produto não encontrado!'});
    }

    res.status(200).json({msg: 'produto deletado com sucesso!', productDeleted});
});

export default router;