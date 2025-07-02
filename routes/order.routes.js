import express from 'express';
const router = express.Router();
import Order from '../models/OrderSchema.js';
import OrderProduct from '../models/OrderProductSchema.js'
import { calculateOrderTotal } from './calculateOrderTotal.js';
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
        const order = await Order.findById(orderId).populate('UserId').populate('BusinessId').populate('CustomerId').populate('OrderStatusId');
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

  if (!Array.isArray(Products) || Products.length === 0) {
    return res.status(400).json({ error: '"Products" deve ser um array com pelo menos um item' });
  }

  try {

    const newOrder = await Order.create({ UserId, BusinessId, CustomerId, OrderStatusId, DiscountAmount, Notes });

   
    const items = Products.map(prod => ({
      OrderId: newOrder._id,
      ProductId: prod.ProductId,
      Quantity: prod.Quantity
    }));

  
    await OrderProduct.insertMany(items);


    await calculateOrderTotal(newOrder._id);
    console.log('Produto: ', items, 'orderId: ', newOrder._id)

    
    const updatedOrder = await Order.findById(newOrder._id);

    res.status(201).json({ msg: 'Pedido criado com sucesso!', order: updatedOrder });

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


