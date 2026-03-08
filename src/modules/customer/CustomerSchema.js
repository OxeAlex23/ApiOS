import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
    BusinessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business" },
    FantasyName: { type: String },
    CustomerName: { type: String, required: true },
    FullAddress: { type: String, required: true },
    City: { type: String, required: true },
    CustomerEmail: { type: String, required: true },
    CustomerPhone: { type: String, required: true },
    CustomerSituation: { type: String, required: true },
    LogoImgUrl: { type: String},
    IsCompany: { type: Boolean, required: true },
    DocNumber: { type: String, required: true },
    LegalNature: { type: String },
    IsMEI: { type: Boolean },
    CreatedAt: { type: Date, default: Date.now },
    IsActive: { type: Boolean, default: true }
});

export default mongoose.model('Customer', CustomerSchema);