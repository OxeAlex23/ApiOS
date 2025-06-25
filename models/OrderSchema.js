import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    UserId: {type: mongoose.Types.ObjectId, ref:  'User', required: true},
  //  BusinessId: {type: mongoose.Types.ObjectId, ref: 'BusinessSchema', required: true},
    OrderDateTime: {type: Date, default: Date.now},
   // CustomerId: Number, // mudar para objectId e add ref
   // OrderStatusId: Number, // mudar para objectId e add ref
    TotalAmount: Number,
    DiscountAmount: Number,
    Notes: String,
    trackCode: String
});

export default mongoose.model('OrderSchema', OrderSchema);