import mongoose from "mongoose";

const BusinessUserRoleSchema = new mongoose.Schema({
    BusinessUserRoleDesc: { type: String, enum: ['admin', 'employee', 'client'], default: 'employee' }
});

export default mongoose.model('BusinessUserRole', BusinessUserRoleSchema);