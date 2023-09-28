
const mongoose = require("mongoose");
const OrderSchema = new mongoose.Schema({
  orderId: {
    type: Number,
    required: true,
  },
  zip: {
    type: Number,
    required: true,
  },
  Date: {
    type: Number,
    required: true,
  },
  Amount:{
    type: Number,
    required: true,
  },
  
  

  

});
const OrderModel = mongoose.model("Order", OrderSchema);
module.exports = OrderModel;