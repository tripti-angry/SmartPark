const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalSpots: {
    type: Number,
    required: true,
    min: 1
  },
  amenities: [{
    type: String,
    enum: ['covered', 'security', 'ev_charging', 'disabled_access', '24_hours']
  }],
  operatingHours: {
    open: {
      type: String,
      default: '00:00'
    },
    close: {
      type: String,
      default: '23:59'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create geospatial index
parkingLotSchema.index({ location: '2dsphere' });

// Virtual for spots
parkingLotSchema.virtual('spots', {
  ref: 'ParkingSpot',
  localField: '_id',
  foreignField: 'parkingLot'
});

parkingLotSchema.set('toJSON', { virtuals: true });
parkingLotSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ParkingLot', parkingLotSchema);