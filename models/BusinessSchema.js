import mongoose from "mongoose";

const BusinessSchema = new mongoose.Schema({
    UserId: {type: String, required: true, ref: 'User'},
    BusinessName: {type: String, required: true},
    FantasyName: {type: String, required: true },
    BusinessType: {type: String, required: true},
    CompanySize: {type: String, required: true},
    LegalNature: { type: String, required: true },
    Address: String,
    Email: {type: String, required: true},
    Phone: {type: String, required: true},
    BusinessCode: { type: String, required: true },
    BusinessSituation: { type: String, required: true },
    IsMEI: {type: Boolean, required: true },
    Coordinates: { type: String, required: true },
    LogoImgUrl: { data: Buffer, contentType: String },
    CreateAt: {type: Date, default: Date.now},
    IsActive: {type: Boolean, default: true}
});

export default mongoose.model('Business', BusinessSchema);