
const mongoose = require("mongoose");
const OrderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },

  cart : [
    {
      productId : {
            type : String,
            required : true
        },
        count : {
            type : Number,
            required : 0
        }
    }
],
  

});
const OrderModel = mongoose.model("Order", OrderSchema);
module.exports = OrderModel;