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
    sizeStock: {
        sizeLarge:{
            large: {
               type: String,
            },
            stock:{
                type:Number
            }
        },
        sizeMedium:{
            medium: {
               type: String,
            },
            stock:{
                type:Number
            }
        },
        sizeSmall:{
            small: {
               type: String,
            },
            stock:{
                type:Number
            }
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