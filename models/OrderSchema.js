import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    Title: { type: String, required: true },
    UserId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    BusinessId: { type: mongoose.Types.ObjectId, ref: 'Business', required: true },
    OrderDateTime: { type: Date, default: Date.now },
    CustomerId: { type: mongoose.Types.ObjectId, ref: 'Customer', required: true },
    CustomerName: { type: String },
    OrderStatusId: { type: mongoose.Types.ObjectId, ref: 'OrderStatus', required: true },
    TotalAmount: { type: Number, default: 0 },
    DiscountAmount: { type: Number, default: 0 },
    AdditionDesc: { type: String },
    AdditionValue: { type: Number },
    Notes: String,
    TrackCode: String,
    RelatedEmployees: [{ type: mongoose.Types.ObjectId, ref: 'Employee' }],
    PaymentMethod: { type: String },
    PaymentTerms: { type: String },
    WarrantyPeriod: { type: String },
    ServiceDuration: { type: String },
    BudgetDate: { type: String },
    BudgetValidity: { type: Number },
    Priority: { type: Number, enum: [1, 2, 3], default: 1 },
    ShowOrderNotesToCustomer: { type: Boolean },
    CanceledAt: {type: Date},
    FinishedAt: {type: Date},
    CreatedAt: {type: Date, default: Date.now}
}
);

export default mongoose.model('Order', OrderSchema);