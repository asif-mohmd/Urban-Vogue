
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  
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


  products:[{
    productId:{
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
  },
  price: {
      type: Number,
      required: true,
  },
  count:{
    type: Number,
    required: true,
  }
  }
  ],

  
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