import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
    BusinessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business" },
    UserId: { type: String, required: true, ref: 'User' },
    FantasyName: { type: String },
    CustomerName: { type: String, required: true },
    CustomerType: { type: String, required: true },
    FullAddress: { type: String, required: true },
    City: { type: String, required: true },
    CustomerEmail: { type: String, required: true },
    CustomerPhone: { type: String, required: true },
    CustomerSituation: { type: String, required: true },
    LogoImgUrl: { data: Buffer, contentType: String },
    IsCompany: { type: Boolean, required: true },
    DocNumber: { type: String, required: true },
    LegalNature: { type: String },
    IsMEI: { type: Boolean },
    CreateAt: { type: Date, default: Date.now },
    IsActive: { type: Boolean, default: true }
});

export default mongoose.model('Customer', CustomerSchema);