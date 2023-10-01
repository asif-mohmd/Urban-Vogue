const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  country: {
    type: String,
   
  },
  address:{
    type: String,
    required: true
  },
  shippingAddress:{
    type : String,
 
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
  status: {
    type : Boolean,
    required: true
  },


});
const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;