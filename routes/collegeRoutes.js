// routes/collegeRoutes.js
// Handles college listing, filtering, admission prediction, and admin CRUD
const express = require('express');
const router = express.Router();
const College = require('../models/College');
const Prediction = require('../models/Prediction');
const { requireAdmin, optionalAuth } = require('../middleware/authMiddleware');

// 1. Get all colleges with optional search and filters (College Directory)
router.get('/', async (req, res) => {
  try {
    const { search, course, region, type, maxFees } = req.query;
    let query = {};

    // Search by name or location
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Filter by Region
    if (region && region !== 'All') {
      query.region = region;
    }

    // Filter by College Type
    if (type && type !== 'All') {
      query.type = type;
    }

    // Filter by Course
    if (course && course !== 'All') {
      query['courses.courseName'] = course;
    }

    let colleges = await College.find(query).sort({ rating: -1, name: 1 });

    // Optional Filter by Maximum Fees
    if (maxFees && Number(maxFees) > 0) {
      const budget = Number(maxFees);
      colleges = colleges.filter(college => {
        // If a specific course is chosen, check that course's fees; else check if any course fits budget
        if (course && course !== 'All') {
          const c = college.courses.find(item => item.courseName === course);
          return c ? c.fees <= budget : false;
        }
        return college.courses.some(item => item.fees <= budget);
      });
    }

    res.json({ success: true, count: colleges.length, colleges });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching colleges: ' + error.message });
  }
});

// 2. Get single college details by ID
router.get('/:id', async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found.' });
    }
    res.json({ success: true, college });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching college details: ' + error.message });
  }
});

// 3. College Admission Predictor
router.post('/predict', optionalAuth, async (req, res) => {
  try {
    const { percentage, course, region, budget, type } = req.body;
    const userPercent = parseFloat(percentage);

    if (isNaN(userPercent) || userPercent < 35 || userPercent > 100) {
      return res.status(400).json({ message: 'Please enter a valid 12th percentage between 35 and 100.' });
    }

    if (!course) {
      return res.status(400).json({ message: 'Please select a course.' });
    }

    // Query for colleges offering the selected course
    let query = {
      'courses.courseName': course
    };

    if (region && region !== 'All') {
      query.region = region;
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    let colleges = await College.find(query);

    // Apply budget filter if specified
    if (budget && Number(budget) > 0) {
      const maxBudget = Number(budget);
      colleges = colleges.filter(col => {
        const c = col.courses.find(item => item.courseName === course);
        return c ? c.fees <= maxBudget : true;
      });
    }

    // Calculate estimated chance for each college
    const predictions = colleges.map(college => {
      const courseInfo = college.courses.find(c => c.courseName === course);
      const cutoff = courseInfo ? courseInfo.cutoff : 75;
      const difference = userPercent - cutoff;

      let chance = "Low";
      let chanceClass = "chance-low";

      if (difference >= 5) {
        chance = "High";
        chanceClass = "chance-high";
      } else if (difference >= 0) {
        chance = "Medium";
        chanceClass = "chance-medium";
      } else if (difference >= -4) {
        chance = "Low";
        chanceClass = "chance-low";
      } else {
        chance = "Very Low";
        chanceClass = "chance-low";
      }

      return {
        _id: college._id,
        name: college.name,
        location: college.location,
        region: college.region,
        type: college.type,
        rating: college.rating,
        website: college.website,
        course: course,
        cutoff: cutoff,
        fees: courseInfo ? courseInfo.fees : 0,
        feesDisplay: courseInfo ? courseInfo.feesDisplay : "Please verify with college",
        eligibility: courseInfo ? courseInfo.eligibility : "12th Standard",
        difference: parseFloat(difference.toFixed(2)),
        chance,
        chanceClass
      };
    });

    // Sort predictions: High chance first, then Medium, then Low
    const chanceOrder = { "High": 1, "Medium": 2, "Low": 3, "Very Low": 4 };
    predictions.sort((a, b) => {
      if (chanceOrder[a.chance] !== chanceOrder[b.chance]) {
        return chanceOrder[a.chance] - chanceOrder[b.chance];
      }
      return b.cutoff - a.cutoff; // higher cutoff prestige first within the same chance band
    });

    // If user is logged in, automatically save this prediction query to history
    if (req.user && req.user.id) {
      try {
        const topMatched = predictions.slice(0, 5).map(p => ({
          collegeName: p.name,
          cutoff: p.cutoff,
          chance: p.chance,
          feesDisplay: p.feesDisplay
        }));

        await Prediction.create({
          userId: req.user.id,
          percentage: userPercent,
          course: course,
          region: region || "All",
          budget: budget ? Number(budget) : 0,
          resultsCount: predictions.length,
          matchedColleges: topMatched
        });
      } catch (err) {
        console.error("Could not save history:", err.message);
      }
    }

    res.json({
      success: true,
      userPercentage: userPercent,
      selectedCourse: course,
      count: predictions.length,
      predictions
    });
  } catch (error) {
    res.status(500).json({ message: 'Prediction failed: ' + error.message });
  }
});

// 4. Admin Only: Add a new college
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, location, region, type, website, rating, established, description, courses } = req.body;

    if (!name || !location || !region) {
      return res.status(400).json({ message: 'College name, location, and region are required.' });
    }

    const college = new College({
      name,
      location,
      region,
      type: type || 'Unaided',
      website: website || '',
      rating: rating || 4.0,
      established: established || 2000,
      description: description || '',
      courses: courses || []
    });

    await college.save();
    res.status(201).json({ message: 'College added successfully!', college });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add college: ' + error.message });
  }
});

// 5. Admin Only: Edit an existing college
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const college = await College.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!college) {
      return res.status(404).json({ message: 'College not found.' });
    }

    res.json({ message: 'College updated successfully!', college });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update college: ' + error.message });
  }
});

// 6. Admin Only: Delete a college
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const college = await College.findByIdAndDelete(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found.' });
    }
    res.json({ message: 'College deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete college: ' + error.message });
  }
});

module.exports = router;
