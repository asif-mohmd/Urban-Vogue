const mongoose = require("mongoose");


const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    size: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    imageUrl: {
       type:   Array,
       required : true
    },
    description: {
        type: String,
        required : true
    },
    stock: {
        type: Number,
        required: true,
    },

    listStatus: 
    { 
        type: Boolean, 
        default: true
    },
    deleteStatus: 
    { 
         type: Boolean, 
         default: false
    }

})
const ProductModel = mongoose.model("Product", ProductSchema);
module.exports = ProductModel;