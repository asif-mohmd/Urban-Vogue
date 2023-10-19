const mongoose = require("mongoose")

const AddressSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },

    address: [
        {
            name: {
                type: String,
                required: true,
            },
            mobile: {
                type: String,
                required: true
            },
            address: {
                type: String,
                required: true
            },

            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            pincode: {
                type: String,
                required: true
            },
        }
    ]




})

const AddressModel = mongoose.model("Address", AddressSchema)
module.exports = AddressModel


