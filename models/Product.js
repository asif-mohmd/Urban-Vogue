const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

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
        large:{
            type: String,
        
        },
        medium:{
            type: String,
           
        },
        small:{
            type: String,
           
        },   
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

ProductSchema.plugin(mongoosePaginate);
const ProductModel = mongoose.model("Product", ProductSchema);
module.exports = ProductModel;