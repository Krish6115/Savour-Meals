const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodDonation',
    required: true,
    unique: true
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pickupTime: {
    type: Date
  },
  deliveryTime: {
    type: Date
  },
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },
  status: {
    type: String,
    enum: ['assigned', 'picked', 'in_transit', 'delivered'],
    default: 'assigned'
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  pickupOtp: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Indexes (donationId already has unique index from schema definition)
deliverySchema.index({ volunteerId: 1, status: 1 });

module.exports = mongoose.model('Delivery', deliverySchema);

