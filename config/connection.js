const mongoose = require('mongoose');

const dotenv = require("dotenv");
dotenv.config();


const database = process.env.MONGOLAB_URI;


const connectDB = async () => {
    mongoose.set("strictQuery", true);
    const db = await mongoose.connect(database, { useUnifiedTopology: true, useNewUrlParser: true })
        .then(() => console.log('Database connected'))
        .catch(err => console.log(err + "DB not connected"));

}

module.exports = connectDB