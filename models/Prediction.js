// models/Prediction.js
// Stores previous prediction queries for logged-in students
const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  percentage: { type: Number, required: true },
  course: { type: String, required: true },
  region: { type: String, default: "All" },
  budget: { type: Number, default: 0 },
  resultsCount: { type: Number, default: 0 },
  matchedColleges: [{
    collegeName: String,
    cutoff: Number,
    chance: String,
    feesDisplay: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Prediction', predictionSchema);
