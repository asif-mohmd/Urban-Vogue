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
  DOB: {
    type: Number,
    default: "18-06-2002",
  },
});
const User = mongoose.model("User", UserSchema);
module.exports = User;