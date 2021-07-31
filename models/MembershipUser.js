const mongoose = require("mongoose");

const MembershipUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
      },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  }, 
  status: {
    type: String,
    required: true,
  }
});

module.exports = new mongoose.model("MembershipUser", MembershipUserSchema);
