const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config()
const databaseUrl = process.env.MONGO_URI;

mongoose.connect(databaseUrl).then(() =>{
    console.log('DB CONNECTION SUCCESFULL')
}).catch((err) =>{
    console.log(err.message)
})