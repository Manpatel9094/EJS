const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
      }, 
    email: {
        type: String,
        required: true,
      }, 
    vname: {
        type: String,
        required: true,
    },
    Desc: {
        type: String,
        required: true,
    },
    owner_email:{
      type: String,
      required: true,
  }
});

module.exports = new mongoose.model("Feedback", FeedbackSchema);
