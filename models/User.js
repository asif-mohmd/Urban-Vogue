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

  address: {
    type: String,
    required: true
  },

  state: {
    type: String,
    required: true
  },

  city: {
    type: String,
    required: true
  },

  pincode: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true,
  },
  wallet: {
    type: Number,
    required: true,
  },

  status: {
    type: Boolean,
    required: true
  },


});
const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
