import mongoose from "mongoose";

const CompraSchema = new mongoose.Schema({
    user: {
        id: {type: mongoose.Types.ObjectId, ref: 'User', required: true},
        FirstName: String,
        LastName: String
    },
    products: [
        {
            _id: false,
            id: {type: mongoose.Types.ObjectId, ref: 'ProductSchema'},
            name: {type: String, required: true}
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('CompraSchema', CompraSchema);

// trocar compraSchema por OrderProduct