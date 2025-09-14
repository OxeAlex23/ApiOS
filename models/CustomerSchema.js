import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
    BusinessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business" },
    UserId: { type: String, required: true, ref: 'User' },
    CustomerName: { type: String, required: true },
    CustomerType: { type: String, required: true },
    Address: { type: String, required: true },
    CustomerEmail: { type: String, required: true },
    CustomerPhone: { type: String, required: true },
    CustomerSituation: { type: String, required: true },
    LogoImgUrl: { data: Buffer, contentType: String },
    IsCompany: { type: Boolean, required: true },
    DocNumber: { type: String, required: true },
    CreateAt: { type: Date, default: Date.now },
    IsActive: { type: Boolean, default: true }
});

export default mongoose.model('Customer', CustomerSchema);