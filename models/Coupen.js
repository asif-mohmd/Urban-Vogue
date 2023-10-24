const mongoose = require("mongoose");

const CoupenSchema = new mongoose.Schema({
    coupenName: {
        type: String,
        required: true,
    },
    coupenPercentage:{
        type: Number,
        required: true
    },
    listStatus: {
        type : Boolean,
        required: true
      }


})
const CoupenModel = mongoose.model("Coupen", CoupenSchema);
module.exports = CoupenModel;