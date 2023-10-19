const mongoose = require("mongoose")

const AddressSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
    mobile:{
        type: String,
        required: true
    },
    addressLine:{
        type: String,
        required: true
    },

    city:{
        type: String,
        required: true
    },
    state:{
        type: String,
        required: true
    },
    pincode:{
        type: String,
        required: true
    },
    is_default: {
        type: Boolean,
        required: true
    }

})

const addressModel = mongoose.model("Address",AddressSchema)
module.exports = addressModel


