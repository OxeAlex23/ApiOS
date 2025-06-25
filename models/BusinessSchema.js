import mongoose from "mongoose";

const BusinessSchema = new mongoose.Schema({
    BusinessName: {type: String, required: true},
    LogoImgUrl: String,
    Address: String,
    City: String,
    State: String,
    PhoneNumber: Number,
    EmailAddress: String,
    Description: String,
    AreaId: Number,
    CreateAt: {type: Date, default: Date.now},
    IsActive: {type: Boolean, default: true}
});

export default mongoose.model('BusinessSchema', BusinessSchema);