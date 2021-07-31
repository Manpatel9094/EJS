const mongoose = require("mongoose");

const CitySchema = new mongoose.Schema({
  city_name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  }
});

module.exports = new mongoose.model("City", CitySchema);
