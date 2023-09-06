const mongoose = require('mongoose');

const dotenv = require("dotenv");
dotenv.config();
const database = process.env.MONGOLAB_URI;


const connectDB = async() => {
    mongoose.set("strictQuery", true);
const db = await mongoose.connect(database, {useUnifiedTopology: true, useNewUrlParser: true })
.then(() => console.log('e don connect'))
.catch(err => console.log(err+"myreeeee"));

}

module.exports = connectDB