// routes/historyRoutes.js
// Handles student prediction history
const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');
const { requireAuth } = require('../middleware/authMiddleware');

// 1. Get prediction history for logged in user
router.get('/', requireAuth, async (req, res) => {
  try {
    const history = await Prediction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, count: history.length, history });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history: ' + error.message });
  }
});

// 2. Delete a single prediction from history
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const record = await Prediction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!record) {
      return res.status(404).json({ message: 'History record not found.' });
    }
    res.json({ message: 'Record deleted from history.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting record: ' + error.message });
  }
});

// 3. Clear all prediction history for logged in user
router.delete('/', requireAuth, async (req, res) => {
  try {
    await Prediction.deleteMany({ userId: req.user.id });
    res.json({ message: 'Prediction history cleared.' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing history: ' + error.message });
  }
});

module.exports = router;
