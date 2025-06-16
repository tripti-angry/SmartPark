const express = require('express');
const ParkingLot = require('../models/ParkingLot');
const ParkingSpot = require('../models/ParkingSpot');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get all parking lots
router.get('/lots', async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;
    
    let query = { isActive: true };
    
    // If location provided, find nearby parking lots
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      };
    }

    const parkingLots = await ParkingLot.find(query)
      .populate('spots')
      .lean();

    // Calculate availability for each lot
    const lotsWithAvailability = parkingLots.map(lot => {
      const totalSpots = lot.spots.length;
      const availableSpots = lot.spots.filter(spot => spot.status === 'available').length;
      const occupancyRate = totalSpots > 0 ? ((totalSpots - availableSpots) / totalSpots) * 100 : 0;

      return {
        ...lot,
        totalSpots,
        availableSpots,
        occupancyRate: Math.round(occupancyRate),
        currentPrice: calculateDynamicPrice(lot.basePrice, occupancyRate)
      };
    });

    res.json(lotsWithAvailability);
  } catch (error) {
    logger.error('Get parking lots error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific parking lot details
router.get('/lots/:id', async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id)
      .populate('spots')
      .lean();

    if (!parkingLot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }

    const totalSpots = parkingLot.spots.length;
    const availableSpots = parkingLot.spots.filter(spot => spot.status === 'available').length;
    const occupancyRate = totalSpots > 0 ? ((totalSpots - availableSpots) / totalSpots) * 100 : 0;

    res.json({
      ...parkingLot,
      totalSpots,
      availableSpots,
      occupancyRate: Math.round(occupancyRate),
      currentPrice: calculateDynamicPrice(parkingLot.basePrice, occupancyRate)
    });
  } catch (error) {
    logger.error('Get parking lot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available spots for a parking lot
router.get('/lots/:id/spots', async (req, res) => {
  try {
    const spots = await ParkingSpot.find({
      parkingLot: req.params.id,
      status: 'available'
    });

    res.json(spots);
  } catch (error) {
    logger.error('Get parking spots error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dynamic pricing calculation
function calculateDynamicPrice(basePrice, occupancyRate) {
  if (occupancyRate >= 90) return basePrice * 1.5;
  if (occupancyRate >= 75) return basePrice * 1.3;
  if (occupancyRate >= 50) return basePrice * 1.1;
  return basePrice;
}

module.exports = router;