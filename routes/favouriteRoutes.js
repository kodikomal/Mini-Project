// routes/favouriteRoutes.js
// Handles student favourite colleges (save, list, remove)
const express = require('express');
const router = express.Router();
const Favourite = require('../models/Favourite');
const { requireAuth } = require('../middleware/authMiddleware');

// 1. Get all favourites for logged in user
router.get('/', requireAuth, async (req, res) => {
  try {
    const favourites = await Favourite.find({ userId: req.user.id })
      .populate('collegeId')
      .sort({ createdAt: -1 });

    // Filter out any records where college was deleted
    const validFavourites = favourites
      .filter(fav => fav.collegeId !== null)
      .map(fav => fav.collegeId);

    res.json({ success: true, count: validFavourites.length, favourites: validFavourites });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favourites: ' + error.message });
  }
});

// 2. Add a college to favourites
router.post('/:collegeId', requireAuth, async (req, res) => {
  try {
    const { collegeId } = req.params;

    const existing = await Favourite.findOne({ userId: req.user.id, collegeId });
    if (existing) {
      return res.status(400).json({ message: 'This college is already in your favourites.' });
    }

    const fav = new Favourite({
      userId: req.user.id,
      collegeId
    });

    await fav.save();
    res.status(201).json({ message: 'College added to favourites!' });
  } catch (error) {
    res.status(500).json({ message: 'Could not add favourite: ' + error.message });
  }
});

// 3. Remove a college from favourites
router.delete('/:collegeId', requireAuth, async (req, res) => {
  try {
    const { collegeId } = req.params;
    await Favourite.findOneAndDelete({ userId: req.user.id, collegeId });
    res.json({ message: 'College removed from favourites.' });
  } catch (error) {
    res.status(500).json({ message: 'Could not remove favourite: ' + error.message });
  }
});

module.exports = router;
