import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
    EmployeeName: { type: String, required: true },
    JobTitle: { type: String, required: true },
});

export default mongoose.model('Employee', EmployeeSchema);