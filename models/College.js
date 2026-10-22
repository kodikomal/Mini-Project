// models/College.js
// Defines the schema for colleges and their courses
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true }, // e.g. "B.Sc. IT", "BCA", "B.Sc. CS"
  cutoff: { type: Number, required: true },     // 12th percentage cutoff e.g. 82.5
  fees: { type: Number, default: 0 },           // Numeric fees for budget filtering e.g. 45000
  feesDisplay: { type: String, default: "Please verify with college" }, // Display text e.g. "₹45,000 / year"
  eligibility: { type: String, default: "12th Science / Mathematics" }
});

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true },       // e.g. "Churchgate, Mumbai"
  region: { 
    type: String, 
    required: true,
    enum: ["South Mumbai", "Western Suburbs", "Central Suburbs", "Navi Mumbai", "Thane"] 
  },
  type: { 
    type: String, 
    enum: ["Autonomous", "Aided", "Unaided", "Government"],
    default: "Unaided"
  },
  website: { type: String, default: "" },
  rating: { type: Number, default: 4.2 },
  established: { type: Number, default: 2000 },
  description: { type: String, default: "" },
  courses: [courseSchema]
}, { timestamps: true });

module.exports = mongoose.model('College', collegeSchema);
