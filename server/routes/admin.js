const express = require('express');
const ParkingLot = require('../models/ParkingLot');
const ParkingSpot = require('../models/ParkingSpot');
const Booking = require('../models/Booking');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const logger = require('../utils/logger');

const router = express.Router();

// Get dashboard stats
router.get('/dashboard', [auth, adminAuth], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalParkingLots = await ParkingLot.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: 'active' });
    
    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const recentBookings = await Booking.find()
      .populate(['user', 'parkingLot'])
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stats: {
        totalUsers,
        totalParkingLots,
        totalBookings,
        activeBookings,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentBookings
    });
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create parking lot
router.post('/parking-lots', [auth, adminAuth], async (req, res) => {
  try {
    const { name, address, coordinates, basePrice, totalSpots } = req.body;

    const parkingLot = new ParkingLot({
      name,
      address,
      location: {
        type: 'Point',
        coordinates: [coordinates.lng, coordinates.lat]
      },
      basePrice,
      totalSpots
    });

    await parkingLot.save();

    // Create parking spots
    const spots = [];
    for (let i = 1; i <= totalSpots; i++) {
      spots.push({
        parkingLot: parkingLot._id,
        spotNumber: `A${i.toString().padStart(3, '0')}`,
        type: 'regular',
        status: 'available'
      });
    }

    await ParkingSpot.insertMany(spots);

    logger.info(`Parking lot created: ${parkingLot._id} with ${totalSpots} spots`);

    res.status(201).json({
      message: 'Parking lot created successfully',
      parkingLot
    });
  } catch (error) {
    logger.error('Create parking lot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookings
router.get('/bookings', [auth, adminAuth], async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate(['user', 'parkingLot', 'parkingSpot'])
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    logger.error('Get admin bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;