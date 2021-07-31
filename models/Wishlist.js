const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
      }, 
    email: {
        type: String,
        required: true,
      }, 
    v_name: {
        type: String,
        required: true,
    }
});

module.exports = new mongoose.model("Wishlist", WishlistSchema);
