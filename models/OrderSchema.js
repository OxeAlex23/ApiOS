import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    UserId: {type: mongoose.Types.ObjectId, ref:  'User', required: true},
    BusinessId: {type: mongoose.Types.ObjectId, ref: 'Business', required: true},
    OrderDateTime: {type: Date, default: Date.now},
    CustomerId: {type: mongoose.Types.ObjectId, ref: 'Customer', required: true},
   // OrderStatusId: Number, // mudar para objectId e add ref
    TotalAmount: Number,
    DiscountAmount: Number,
    Notes: String,
    trackCode: String
});

export default mongoose.model('Order', OrderSchema);