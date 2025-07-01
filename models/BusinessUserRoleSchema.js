import mongoose from "mongoose";

const BusinessUserRoleSchema = new mongoose.Schema({
    BusinnessUserRoleDesc: { type: String, enum: ['admin', 'employee', 'client'], default: 'employee' }
});

export default mongoose.model('BusinessUserRole', BusinessUserRoleSchema);