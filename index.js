const express= require('express');
const dotenv= require('dotenv');
const dbConnect = require('./dbConnect');
const mainRouter = require('./routes');
const cors= require('cors');
const cookieParser= require('cookie-parser');
const cloudinary= require('cloudinary').v2;

const app= express();

app.use(cookieParser());
app.use(express.json({
    limit: '100mb'
}));

let origin= "http://localhost:3000";

if(process.env.NODE_ENV==='production')
    origin="https://communalclient.onrender.com";

app.use(cors({
    origin,
    credentials: true
}))

dotenv.config("./.env");

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
  });
app.use('/api', mainRouter);

dbConnect();

app.get('/', (req, res)=>{
    res.send("Okay from server!");
});

const PORT= process.env.PORT || 4000;

app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}...`);
    console.log("here is node_env ", process.env.NODE_ENV);
});