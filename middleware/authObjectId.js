import mongoose from "mongoose";

export default function validateObjectid(req, res, next) {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({msg: 'Id inválido!'})
    }

    next();
}