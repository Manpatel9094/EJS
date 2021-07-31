const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
      },
      
      OwnerName: {
        type: String,
        required: true,
      },
      CustomerName: {
        type: String,
        required: true,
      },
  session: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  Peoples: {
    type: String,
    required: true,
  },
  BookingDate: {
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

module.exports = new mongoose.model("Booking", BookingSchema);
