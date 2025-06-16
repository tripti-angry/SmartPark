const express = require('express');
const Booking = require('../models/Booking');
const ParkingSpot = require('../models/ParkingSpot');
const ParkingLot = require('../models/ParkingLot');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    const { spotId, startTime, endTime, vehicleNumber } = req.body;

    // Check if spot is available
    const spot = await ParkingSpot.findById(spotId).populate('parkingLot');
    if (!spot || spot.status !== 'available') {
      return res.status(400).json({ message: 'Parking spot not available' });
    }

    // Calculate duration and price
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationHours = Math.ceil((end - start) / (1000 * 60 * 60));
    
    const occupancyRate = await calculateOccupancyRate(spot.parkingLot._id);
    const currentPrice = calculateDynamicPrice(spot.parkingLot.basePrice, occupancyRate);
    const totalAmount = currentPrice * durationHours;

    // Create booking
    const booking = new Booking({
      user: req.user.userId,
      parkingSpot: spotId,
      parkingLot: spot.parkingLot._id,
      startTime: start,
      endTime: end,
      vehicleNumber,
      totalAmount,
      pricePerHour: currentPrice
    });

    await booking.save();

    // Update spot status
    await ParkingSpot.findByIdAndUpdate(spotId, { 
      status: 'reserved',
      reservedBy: req.user.userId,
      reservedUntil: end
    });

    logger.info(`Booking created: ${booking._id} by user ${req.user.userId}`);

    res.status(201).json({
      message: 'Booking created successfully',
      booking: await booking.populate(['parkingSpot', 'parkingLot'])
    });
  } catch (error) {
    logger.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.userId })
      .populate(['parkingSpot', 'parkingLot'])
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    logger.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    // Free up the parking spot
    await ParkingSpot.findByIdAndUpdate(booking.parkingSpot, {
      status: 'available',
      $unset: { reservedBy: 1, reservedUntil: 1 }
    });

    logger.info(`Booking cancelled: ${booking._id}`);

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    logger.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate occupancy rate
async function calculateOccupancyRate(parkingLotId) {
  const spots = await ParkingSpot.find({ parkingLot: parkingLotId });
  const totalSpots = spots.length;
  const availableSpots = spots.filter(spot => spot.status === 'available').length;
  return totalSpots > 0 ? ((totalSpots - availableSpots) / totalSpots) * 100 : 0;
}

// Dynamic pricing calculation
function calculateDynamicPrice(basePrice, occupancyRate) {
  if (occupancyRate >= 90) return basePrice * 1.5;
  if (occupancyRate >= 75) return basePrice * 1.3;
  if (occupancyRate >= 50) return basePrice * 1.1;
  return basePrice;
}

module.exports = router;