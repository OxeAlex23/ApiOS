import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    Title: { type: String, required: true },
    UserId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    BusinessId: { type: mongoose.Types.ObjectId, ref: 'Business', required: true },
    OrderDateTime: { type: Date, default: Date.now },
    CustomerId: { type: mongoose.Types.ObjectId, ref: 'Customer', required: true },
    OrderStatusId: { type: mongoose.Types.ObjectId, ref: 'OrderStatus', required: true },
    TotalAmount: { type: Number, default: 0 },
    DiscountAmount: { type: Number, default: 0 },
    Notes: String,
    trackCode: String,
    RelatedEmployees: [{ type: mongoose.Types.ObjectId, ref: 'Employee' }],
    Priority: { type: Number, enum: [1, 2, 3], default: 1 },
},
    { timestamps: true }
);

export default mongoose.model('Order', OrderSchema);