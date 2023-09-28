
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
  date: {
    type: String,
    required: true,
  },
  amount:{
    type: Number,
    required: true,
  },
  status:{
    type: String,
    required: true
  }
  
  

  

});
const OrderModel = mongoose.model("Order", OrderSchema);
module.exports = OrderModel;