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
    wishlist:{
        type: Boolean, 
        default: false
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