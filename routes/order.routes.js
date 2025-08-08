import express from 'express';
const router = express.Router();
import Order from '../models/OrderSchema.js';
import { calculateOrderTotal } from './calculateOrderTotal.js';
import authObjectId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    const orders = await Order.find();
    res.json(orders);
});



router.get('/ordersByBusiness/:businessId', async (req, res) => {
    const businessId = req.params.businessId; 
    if (!businessId) {
        return res.status(404).json({ msg: 'business Not Found!' });
    }   
    try {
        const orders = await Order.find({ BusinessId: businessId });

        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});

router.get('/:id', authObjectId, async (req, res) => {
    const orderId = req.params.id;
    if (!orderId) {
        return res.status(404).json({ msg: 'order Not Found!' })
    }
    try {
        const order = await Order.findById(orderId).populate('UserId', 'FirstName LastName -_id')
        .populate('BusinessId', 'BusinessName -_id')
        .populate('CustomerId', '-__v -BusinessId -_id')
        .populate('OrderStatusId', '-_id -__v')
        .populate('RelatedEmployees', 'EmployeeName JobTitle -_id' )

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

});

router.post('/', async (req, res) => {
    const { Title, UserId, BusinessId, CustomerId, OrderStatusId, TotalAmount, DiscountAmount, Notes, trackCode, RelatedEmployees, Priority } = req.body;
    if (!Title || !UserId || !BusinessId || !CustomerId || !OrderStatusId) {
        return res.status(400).json({ error: 'All required fields must be completed!' });
    }   
    try {
        const order = await Order.create({ Title, UserId, BusinessId, CustomerId, OrderStatusId, TotalAmount, DiscountAmount, Notes, trackCode, RelatedEmployees, Priority });
        res.status(201).json({ msg: 'order created successfully!', order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
   const { Title ,UserId, BusinessId, CustomerId, OrderStatusId, TotalAmount, DiscountAmount, Notes, trackCode, RelatedEmployees, Priority } = req.body;


  try {

    const newOrder = await Order.create({ Title ,UserId, BusinessId, CustomerId, OrderStatusId, TotalAmount, DiscountAmount, Notes, trackCode, RelatedEmployees, Priority });

    await calculateOrderTotal(newOrder._id);

    
    const updatedOrder = await Order.findById(newOrder._id);

    res.status(201).json({ msg: 'order crated successfully!', order: updatedOrder });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authObjectId, async (req, res) => {
    const orderId = req.params.id;
    if (!orderId) {
        return res.status(404).json({ msg: 'order Not Found!' });
    }

    try {
        const updateOrder = await Order.findByIdAndUpdate(orderId, req.body, { new: true });
        res.status(200).json({ msg: 'order updated successfully!', updateOrder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authObjectId, async (req, res) => {
    const orderId = req.params.id;
    if (!orderId) {
        return res.status(404).json({ msg: 'order Not Found!' });
    }

    try {
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        res.status(200).json({ msg: 'order deleted successfully!', deletedOrder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;


