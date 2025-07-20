import mongoose from "mongoose";

const BusinessSchema = new mongoose.Schema({
    UserId: {type: String, required: true, ref: 'User'},
    BusinessName: {type: String, required: true},
    LogoImgUrl: String,
    Address: String,
    City: String,
    State: String,
    PhoneNumber: {type: Number, required: true},
    EmailAddress: {type: String, required: true},
    Description: String,
    AreaId: Number,
    CreateAt: {type: Date, default: Date.now},
    IsActive: {type: Boolean, default: true}
});

export default mongoose.model('Business', BusinessSchema);