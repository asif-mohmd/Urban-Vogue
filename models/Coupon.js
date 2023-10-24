const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema({
    couponName: {
        type: String,
        required: true,
    },
    couponPercentage:{
        type: Number,
        required: true
    },
    listStatus: {
        type : Boolean,
        required: true
      }


})
const CouponModel = mongoose.model("Coupon", CouponSchema);
module.exports = CouponModel;