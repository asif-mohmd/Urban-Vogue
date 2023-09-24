
const mongoose = require("mongoose");
const CartSchema = new mongoose.Schema({
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
const cartModel = mongoose.model("Cart", CartSchema);
module.exports = cartModel;