const mongoose = require("mongoose");

const VenueSchema = new mongoose.Schema({
    v_name: {
        type: String,
        required: true,
    },
    v_address: {
        type: String,
        required: true,
    },
    v_city: {
        type: String,
        required: true,
    },
    v_phone: {
        type: String,
        required: true,
    },
    v_description: {
        type: String,
        required: true,
    },
    v_phone: {
        type: String,
        required: true,
    },
    v_capacity: {
        type: String,
        required: true,
    },
    v_discount: {
        type: String,
        required: true,
    },
    v_deposite: {
        type: String,
        required: true,
    },
    morn_rent: {
        type: String,
        required: true,
    },
    eve_rent: {
        type: String,
        required: true,
    },
    full_rent: {
        type: String,
        required: true,
    },
    add_service: {
        type: String,
        required: true,
    },
    event: {
        type: String,
        required: true,
    },
    image1: {
        type: String,
        required: true,
    }, 
    image2: {
        type: String,
        required: true,
    },
    image3: {
        type: String,
        required: true,
    },
    image4: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    owner_email: {
        type: String,
        required: true,
    },
    Request: {
        type: String,
        required: true,
    }
});
module.exports = new mongoose.model("Venue", VenueSchema);
