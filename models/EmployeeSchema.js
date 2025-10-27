import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
    EmployeeName: { type: String, required: true },
    JobTitle: { type: String, required: true },
    EmployeeImgUrl: { type: String },
    BusinessId: { type: mongoose.Types.ObjectId, ref: 'Business', required: true },
    CreateAt: { type: Date, default: Date.now },
});

export default mongoose.model('Employee', EmployeeSchema);