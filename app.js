import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import indexRoutes from "./src/routes/index.routes.js";

const app = express();
app.use(cors({
    origin: ["https://www.novoos.com.br", "http://localhost:5173"]
}));


app.use(express.json());
app.use(indexRoutes);

const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl, { autoIndex: false }).then(() => {
    app.listen(process.env.PORT);
    console.log('connected to data base!');
}).catch (err => console.error(err)); 