import express from 'express';
const router = express.Router();
import User from '../models/UserSchema.js';
import ProductSchema from '../models/ProductSchema.js';
import CompraSchema from '../models/CompraSchema.js';

router.post('/', async (req, res) => {
    try {
        const {userId, productId} = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({msg: 'usuário não encontrado!'});
        }

        const products = await ProductSchema.find({_id: {$in: productId}});
        if (products.length === 0) {
            return res.status(404).json({msg: 'nenhum produto encontrado!'});
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
        res.status(200).json({msg: 'Compra registrada com sucesso', savedCompra})
    } catch (err) {
        res.status(500).json({msg: 'erro ao criar compra!'});
    }
});

export default router;