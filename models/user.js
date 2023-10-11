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

  address: 
    {
      homeAddress: {
        type: String,
        required: true
      },
      officeAddress: {
        type: String,

      },
      customAddress: {
        type: String,
      }
    },
  

  status: {
    type: Boolean,
    required: true
  },


});
const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;