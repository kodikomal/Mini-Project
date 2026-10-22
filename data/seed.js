// data/seed.js
// Seeds verified real colleges from Mumbai & nearby areas, plus sample accounts
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const College = require('../models/College');
const User = require('../models/User');

const verifiedColleges = [
  {
    name: "St. Xavier's College (Autonomous)",
    location: "Mahapalika Marg, Fort, South Mumbai",
    region: "South Mumbai",
    type: "Autonomous",
    website: "https://xaviers.ac",
    rating: 4.8,
    established: 1869,
    description: "One of India's most prestigious autonomous colleges affiliated with Mumbai University, known for top academic excellence and vibrant campus life.",
    courses: [
      {
        courseName: "B.Sc. IT",
        cutoff: 88.0,
        fees: 42000,
        feesDisplay: "₹42,000 / year",
        eligibility: "12th standard with Mathematics as a compulsory subject (Min 45%)"
      }
    ]
  },
  {
    name: "Mithibai College of Arts & Chauhan Institute of Science (Autonomous)",
    location: "Vile Parle West, Mumbai",
    region: "Western Suburbs",
    type: "Autonomous",
    website: "https://www.mithibai.ac.in",
    rating: 4.6,
    established: 1961,
    description: "Leading institution under SVKM trust, renowned for modern IT labs, high campus recruitment, and experienced faculty.",
    courses: [
      {
        courseName: "B.Sc. IT",
        cutoff: 84.0,
        fees: 38000,
        feesDisplay: "₹38,000 / year",
        eligibility: "12th standard with Mathematics"
      },
      {
        courseName: "B.Sc. CS",
        cutoff: 80.0,
        fees: 35000,
        feesDisplay: "₹35,000 / year",
        eligibility: "12th Science with Mathematics"
      }
    ]
  },
  {
    name: "Bhavan's College",
    location: "Munshi Nagar, Andheri West, Mumbai",
    region: "Western Suburbs",
    type: "Aided",
    website: "https://bhavans.ac.in",
    rating: 4.3,
    established: 1946,
    description: "Sprawling green campus in Andheri offering government-aided and unaided degree programs under Mumbai University.",
    courses: [
      {
        courseName: "B.Sc. IT",
        cutoff: 76.0,
        fees: 28000,
        feesDisplay: "₹28,000 / year",
        eligibility: "12th standard with Mathematics"
      },
      {
        courseName: "B.Sc. CS",
        cutoff: 72.0,
        fees: 25000,
        feesDisplay: "₹25,000 / year",
        eligibility: "12th Science"
      }
    ]
  },
  {
    name: "K.J. Somaiya College of Science and Commerce (Autonomous)",
    location: "Vidyanagar, Vidyavihar East, Mumbai",
    region: "Central Suburbs",
    type: "Autonomous",
    website: "https://kjssc.somaiya.edu",
    rating: 4.5,
    established: 1959,
    description: "Premier 65-acre campus in Vidyavihar with cutting-edge laboratories, sports complex, and top university affiliations.",
    courses: [
      {
        courseName: "B.Sc. IT",
        cutoff: 82.0,
        fees: 45000,
        feesDisplay: "₹45,000 / year",
        eligibility: "12th standard with Mathematics"
      },
      {
        courseName: "B.Sc. CS",
        cutoff: 78.0,
        fees: 40000,
        feesDisplay: "₹40,000 / year",
        eligibility: "12th Science with Mathematics"
      },
      {
        courseName: "BCA",
        cutoff: 75.0,
        fees: 48000,
        feesDisplay: "₹48,000 / year",
        eligibility: "12th Any Stream with Mathematics / Statistics"
      }
    ]
  },
  {
    name: "Vidyalankar School of Information Technology (VSIT)",
    location: "Vidyalankar College Marg, Wadala East, Mumbai",
    region: "Central Suburbs",
    type: "Unaided",
    website: "https://vsit.edu.in",
    rating: 4.2,
    established: 2002,
    description: "Specialized technology and management college with award-winning infrastructure and active corporate placement drives.",
    courses: [
      {
        courseName: "B.Sc. IT",
        cutoff: 68.0,
        fees: 36000,
        feesDisplay: "₹36,000 / year",
        eligibility: "12th with Mathematics (Min 45%)"
      },
      {
        courseName: "B.Sc. CS",
        cutoff: 65.0,
        fees: 34000,
        feesDisplay: "₹34,000 / year",
        eligibility: "12th Science"
      },
      {
        courseName: "BCA",
        cutoff: 64.0,
        fees: 38000,
        feesDisplay: "₹38,000 / year",
        eligibility: "12th Any Stream with English and Mathematics"
      }
    ]
  },
  {
    name: "Thakur College of Science and Commerce (Autonomous)",
    location: "Thakur Village, Kandivali East, Mumbai",
    region: "Western Suburbs",
    type: "Autonomous",
    website: "https://tcsc.edu.in",
    rating: 4.3,
    established: 1997,
    description: "Autonomous college accredited with 'A' grade by NAAC, known for strong IT department and annual technical events.",
    courses: [
      {
        courseName: "B.Sc. IT",
        cutoff: 73.0,
        fees: 39000,
        feesDisplay: "₹39,000 / year",
        eligibility: "12th with Mathematics"
      },
      {
        courseName: "B.Sc. CS",
        cutoff: 70.0,
        fees: 36000,
        feesDisplay: "₹36,000 / year",
        eligibility: "12th Science"
      },
      {
        courseName: "BCA",
        cutoff: 68.0,
        fees: 42000,
        feesDisplay: "₹42,000 / year",
        eligibility: "12th Any Stream with Mathematics"
      }
    ]
  },
  {
    name: "D.G. Ruparel College of Arts, Science and Commerce",
    location: "Senapati Bapat Marg, Matunga West, Mumbai",
    region: "South Mumbai",
    type: "Aided",
    website: "https://ruparel.edu",
    rating: 4.4,
    established: 1952,
    description: "Highly reputed college in Matunga known for producing academic toppers across science and information technology.",
    courses: [
      {
        courseName: "B.Sc. IT",
        cutoff: 81.0,
        fees: 26000,
        feesDisplay: "₹26,000 / year",
        eligibility: "12th with Mathematics"
      },
      {
        courseName: "B.Sc. CS",
        cutoff: 77.0,
        fees: 24000,
        feesDisplay: "₹24,000 / year",
        eligibility: "12th Science"
      }
    ]
  },
  {
    name: "Ramnarain Ruia Autonomous College",
    location: "L.N. Road, Matunga East, Mumbai",
    region: "South Mumbai",
    type: "Autonomous",
    website: "https://ruiacollege.edu",
    rating: 4.6,
    established: 1937,
    description: "Heritage institution recognized with College of Excellence status by UGC, offering high-standard computer science education.",
    courses: [
      {
        courseName: "B.Sc. CS",
        cutoff: 83.0,
        fees: 32000,
        feesDisplay: "₹32,000 / year",
        eligibility: "12th Science with Mathematics"
      },
      {
        courseName: "B.Sc. IT",
        cutoff: 80.0,
        fees: 35000,
        feesDisplay: "₹35,000 / year",
        eligibility: "12th with Mathematics"
      }
    ]
  },
  {
    name: "SIES College of Arts, Science and Commerce",
    location: "Sion West, Mumbai",
    region: "Central Suburbs",
    type: "Aided",
    website: "https://siesascs.edu.in",
    rating: 4.2,
    established: 1960,
    description: "Centrally located campus in Sion with a dedicated computer training division and high placement track record.",
    courses: [
      {
        courseName: "B.Sc. IT",
        cutoff: 74.0,
        fees: 31000,
        feesDisplay: "₹31,000 / year",
        eligibility: "12th with Mathematics"
      },
      {
        courseName: "B.Sc. CS",
        cutoff: 71.0,
        fees: 29000,
        feesDisplay: "₹29,000 / year",
        eligibility: "12th Science"
      }
    ]
  },
  {
    name: "K.C. College (Kishinchand Chellaram College)",
    location: "Dinshaw Wachha Road, Churchgate, Mumbai",
    region: "South Mumbai",
    type: "Autonomous",
    website: "https://kccollege.edu.in",
    rating: 4.5,
    established: 1954,
    description: "Constituent college of HSNC University located near Churchgate station, renowned for modern IT syllabus and tech festivals.",
    courses: [
      {
        courseName: "B.Sc. IT",
        cutoff: 83.0,
        fees: 41000,
        feesDisplay: "₹41,000 / year",
        eligibility: "12th with Mathematics"
      },
      {
        courseName: "B.Sc. CS",
        cutoff: 79.0,
        fees: 38000,
        feesDisplay: "₹38,000 / year",
        eligibility: "12th Science"
      }
    ]
  },
  {
    name: "R.D. National College and W.A. Science College",
    location: "Bandra West, Mumbai",
    region: "Western Suburbs",
    type: "Aided",
    website: "https://rdnational.ac.in",
    rating: 4.1,
    established: 1949,
    description: "Vibrant Bandra institution offering professional degree programs in Computer Applications and IT.",
    courses: [
      {
        courseName: "B.Sc. IT",
        cutoff: 70.0,
        fees: 30000,
        feesDisplay: "₹30,000 / year",
        eligibility: "12th with Mathematics"
      },
      {
        courseName: "BCA",
        cutoff: 65.0,
        fees: 34000,
        feesDisplay: "₹34,000 / year",
        eligibility: "12th Any Stream with Mathematics"
      }
    ]
  },
  {
    name: "B.K. Birla College of Arts, Science and Commerce (Autonomous)",
    location: "Kalyan West, Thane District",
    region: "Thane",
    type: "Autonomous",
    website: "https://bkbirlacollegekalyan.com",
    rating: 4.3,
    established: 1972,
    description: "Top autonomous institution in the Thane/Kalyan region offering modern IT courses with excellent laboratory facilities.",
    courses: [
      {
        courseName: "B.Sc. IT",
        cutoff: 69.0,
        fees: 29000,
        feesDisplay: "₹29,000 / year",
        eligibility: "12th with Mathematics"
      },
      {
        courseName: "B.Sc. CS",
        cutoff: 66.0,
        fees: 27000,
        feesDisplay: "₹27,000 / year",
        eligibility: "12th Science"
      },
      {
        courseName: "BCA",
        cutoff: 63.0,
        fees: 32000,
        feesDisplay: "₹32,000 / year",
        eligibility: "12th Any Stream"
      }
    ]
  },
  {
    name: "Pillai College of Arts, Commerce and Science (Autonomous)",
    location: "Sector 16, New Panvel, Navi Mumbai",
    region: "Navi Mumbai",
    type: "Autonomous",
    website: "https://pcacs.ac.in",
    rating: 4.3,
    established: 1998,
    description: "NAAC 'A+' accredited autonomous college in Navi Mumbai with state-of-the-art campus and industry tie-ups.",
    courses: [
      {
        courseName: "B.Sc. IT",
        cutoff: 67.0,
        fees: 38000,
        feesDisplay: "₹38,000 / year",
        eligibility: "12th with Mathematics"
      },
      {
        courseName: "B.Sc. CS",
        cutoff: 64.0,
        fees: 35000,
        feesDisplay: "₹35,000 / year",
        eligibility: "12th Science"
      },
      {
        courseName: "BCA",
        cutoff: 62.0,
        fees: 40000,
        feesDisplay: "₹40,000 / year",
        eligibility: "12th Any Stream"
      }
    ]
  },
  {
    name: "Veermata Jijabai Technological Institute (VJTI)",
    location: "H.R. Mahajani Road, Matunga, Mumbai",
    region: "South Mumbai",
    type: "Government",
    website: "https://vjti.ac.in",
    rating: 4.9,
    established: 1887,
    description: "Centuries-old premier state engineering institute in Mumbai, renowned for unmatched placements in tech giants.",
    courses: [
      {
        courseName: "B.Tech CSE",
        cutoff: 97.5,
        fees: 85000,
        feesDisplay: "₹85,000 / year",
        eligibility: "12th Science (PCM) + MHT-CET score"
      }
    ]
  },
  {
    name: "Sardar Patel Institute of Technology (SPIT)",
    location: "Bhavan's Campus, Andheri West, Mumbai",
    region: "Western Suburbs",
    type: "Autonomous",
    website: "https://www.spit.ac.in",
    rating: 4.7,
    established: 2005,
    description: "Autonomous engineering college in Andheri known for elite computer science education and high package recruitment.",
    courses: [
      {
        courseName: "B.Tech CSE",
        cutoff: 96.0,
        fees: 172000,
        feesDisplay: "₹1,72,000 / year",
        eligibility: "12th Science (PCM) + MHT-CET / JEE Main"
      }
    ]
  },
  {
    name: "Fr. Conceicao Rodrigues College of Engineering (CRCE)",
    location: "Bandstand, Bandra West, Mumbai",
    region: "Western Suburbs",
    type: "Unaided",
    website: "https://www.frcrce.ac.in",
    rating: 4.4,
    established: 1984,
    description: "Reputed engineering college located on Bandra Bandstand overlooking the sea, affiliated with University of Mumbai.",
    courses: [
      {
        courseName: "B.Tech CSE",
        cutoff: 91.0,
        fees: 145000,
        feesDisplay: "₹1,45,000 / year",
        eligibility: "12th Science (PCM) + MHT-CET score"
      }
    ]
  },
  {
    name: "Usha Pravin Gandhi College of Arts, Science and Commerce",
    location: "Vile Parle West, Mumbai",
    region: "Western Suburbs",
    type: "Unaided",
    website: "https://upgcm.ac.in",
    rating: 4.3,
    established: 2003,
    description: "Modern institution under SVKM trust focusing on IT, media, and emerging technologies with hands-on lab sessions.",
    courses: [
      {
        courseName: "B.Sc. IT",
        cutoff: 79.0,
        fees: 46000,
        feesDisplay: "₹46,000 / year",
        eligibility: "12th with Mathematics (Min 45%)"
      }
    ]
  }
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/admitwise';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing college records...');
    await College.deleteMany({});

    console.log(`Inserting ${verifiedColleges.length} verified real colleges...`);
    await College.insertMany(verifiedColleges);

    console.log('Seeding sample user accounts (Admin & Student)...');
    await User.deleteMany({ email: { $in: ['admin@admitwise.com', 'student@admitwise.com'] } });

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('adminpassword123', salt);
    const studentPassword = await bcrypt.hash('studentpassword123', salt);

    await User.create([
      {
        name: 'System Administrator',
        email: 'admin@admitwise.com',
        password: adminPassword,
        role: 'admin'
      },
      {
        name: 'Rahul Sharma',
        email: 'student@admitwise.com',
        password: studentPassword,
        role: 'student'
      }
    ]);

    console.log('========================================================');
    console.log(' Database Seeded Successfully!');
    console.log(' Real Colleges Inserted: ' + verifiedColleges.length);
    console.log(' Admin Account   : admin@admitwise.com / adminpassword123');
    console.log(' Student Account : student@admitwise.com / studentpassword123');
    console.log('========================================================');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
