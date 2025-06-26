import mongoose from "mongoose";

const ProductCategorySchema = new mongoose.Schema({
    ProductCategoryDesc: [String],
    BusinessId: {type: mongoose.Types.ObjectId, ref: 'BusinessSchema', required: true}
});

export default mongoose.model('ProductCategorySchema', ProductCategorySchema)