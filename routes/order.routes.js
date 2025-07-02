import express from 'express';
const router = express.Router();
import Order from '../models/OrderSchema.js';
import OrderProduct from '../models/OrderProductSchema.js'
import authObjectId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    const orders = await Order.find();
    res.json(orders);
});

router.get('/:id', authObjectId, async (req, res) => {
    const orderId = req.params.id;
    if (!orderId) {
        return res.status(404).json({ msg: 'ordem não encontrada!' })
    }
    try {
        const order = await Order.findById(orderId).populate('UserId').populate('BusinessId').populate('CustomerId');
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

});


router.post('/', async (req, res) => {
    try {
        const order = await Order.create(req.body);
        res.status(200).json({ msg: 'ordem criada com sucesso!', order });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});


router.post('/order-with-products', async (req, res) => {
    const { UserId, BusinessId, CustomerId, OrderStatusId, DiscountAmount, Notes, Products } = req.body;

    try {

        const newOrder = await Order.create({ UserId, BusinessId, CustomerId, OrderStatusId, DiscountAmount, Notes });


        const items = Products.map(prod => ({
            OrderId: newOrder._id,
            ProductId: prod.ProductId,
            Quantity: prod.Quantity
        }));

        await OrderProduct.insertMany(items);


        res.status(201).json({ msg: 'Pedido criado com sucesso!', orderId: newOrder._id });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', authObjectId, async (req, res) => {
    const orderId = req.params.id;
    if (!orderId) {
        return res.status(404).json({ msg: 'ordem não encontrada!' });
    }

    try {
        const updateOrder = await Order.findByIdAndUpdate(orderId, req.body, { new: true });
        res.status(200).json({ msg: 'ordem atualizada com sucesso!', updateOrder });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.delete('/:id', authObjectId, async (req, res) => {
    const orderId = req.params.id;
    if (!orderId) {
        return res.status(404).json({ msg: 'ordem não encontrada!' });
    }

    try {
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        res.status(200).json({ msg: 'ordem deletada com sucesso!', deletedOrder });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

export default router;


