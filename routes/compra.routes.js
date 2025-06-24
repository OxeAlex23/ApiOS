import express from 'express';
import mongoose from 'mongoose';
const router = express.Router();
import User from '../models/UserSchema.js';
import ProductSchema from '../models/ProductSchema.js';
import CompraSchema from '../models/CompraSchema.js';
import authObjectId from '../middleware/authObjectId.js';

router.post('/', async (req, res) => {
    try {
        const { userId, productId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'usuário não encontrado!' });
        }

        const products = await ProductSchema.find({ _id: { $in: productId } });
        if (products.length === 0) {
            return res.status(404).json({ msg: 'nenhum produto encontrado!' });
        }

        const compra = new CompraSchema({
            user: {
                id: userId,
                FirstName: user.FirstName,
                LastName: user.LastName
            },
            products: products.map(product => ({
                id: product.id,
                name: product.ProductName
            }))
        });

        const savedCompra = await compra.save();
        res.status(200).json({ msg: 'Compra registrada com sucesso', savedCompra })
    } catch (err) {
        res.status(500).json({ msg: 'erro ao criar compra!' });
    }
});

router.get('/', async (req, res) => {
    const compras = await CompraSchema.find();
    res.json(compras);
});

router.get('/:id', authObjectId, async (req, res) => {
    const userId = req.params.id;

    try {
        const compras = await CompraSchema.findById(userId);
        if (!compras) {
            return res.status(404).json({ msg: 'comprar não encontrada!' })
        }
        res.json(compras);
    } catch (err) {
        res.status(500).json({ erro: err.message })
    }

});

router.patch('/:id', authObjectId, async (req, res) => {
    const compraId = req.params.id;
    const updateData = req.body;

    try {
        const compra = await CompraSchema.findById(compraId);
        if (!compra) return res.status(404).json({ msg: 'Compra não encontrada!' });

      
        Object.keys(updateData).forEach(key => {
           
            if (typeof updateData[key] === 'object' && !Array.isArray(updateData[key])) {
                Object.keys(updateData[key]).forEach(subKey => {
                    compra[key][subKey] = updateData[key][subKey];
                });
            } else {
                compra[key] = updateData[key];
            }
        });

        await compra.save();

        res.status(200).json({ msg: 'Compra atualizada com sucesso!', compra });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.delete('/:id', authObjectId, async (req, res) => {
    const userId = req.params.id;
    const compraDelete = await CompraSchema.findByIdAndDelete(userId);

    if (!compraDelete) {
        return res.status(404).json({msg: 'compra não encontrada!'})
    }

    res.status(200).json({msg: 'compra deletada com sucesso!'})
})
export default router;