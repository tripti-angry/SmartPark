const mongoose = require('mongoose');

const parkingSpotSchema = new mongoose.Schema({
  parkingLot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLot',
    required: true
  },
  spotNumber: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['regular', 'compact', 'large', 'disabled', 'ev_charging'],
    default: 'regular'
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'maintenance'],
    default: 'available'
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reservedUntil: {
    type: Date
  },
  sensorId: {
    type: String,
    unique: true,
    sparse: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
parkingSpotSchema.index({ parkingLot: 1, status: 1 });
parkingSpotSchema.index({ parkingLot: 1, spotNumber: 1 }, { unique: true });

module.exports = mongoose.model('ParkingSpot', parkingSpotSchema);