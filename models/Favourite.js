// models/Favourite.js
// Stores colleges bookmarked by students
const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  collegeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'College', 
    required: true 
  }
}, { timestamps: true });

// Prevent duplicate favourites for the same user and college
favouriteSchema.index({ userId: 1, collegeId: 1 }, { unique: true });

module.exports = mongoose.model('Favourite', favouriteSchema);
