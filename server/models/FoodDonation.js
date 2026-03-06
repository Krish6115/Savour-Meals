const mongoose = require('mongoose');

const foodDonationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  foodType: {
    type: String,
    required: [true, 'Please specify the type of food']
  },
  quantity: {
    type: Number,
    required: [true, 'Please specify quantity (number of people)'],
    min: 1
  },
  preparedAt: {
    type: Date,
    required: [true, 'Please specify when food was prepared']
  },
  expiryTime: {
    type: Date,
    required: [true, 'Please specify expiry time']
  },
  pickupLocation: {
    address: { type: String, required: true },
    coordinates: {
      // Coordinates are optional for now; only address is required
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'picked', 'delivered', 'rejected', 'expired'],
    default: 'pending'
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deliveryAddress: {
    type: String
  },
  notes: {
    type: String
  },
  rejectedReason: {
    type: String
  },
  pickupOtp: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
foodDonationSchema.index({ status: 1, createdAt: -1 });
foodDonationSchema.index({ donorId: 1 });
foodDonationSchema.index({ ngoId: 1 });
foodDonationSchema.index({ volunteerId: 1 });
// 2dsphere index requires GeoJSON format, but we are using lat/lng structure.
// Disabling index to prevent errors with simple coordinate objects.
// foodDonationSchema.index({ 'pickupLocation.coordinates': '2dsphere' });

module.exports = mongoose.model('FoodDonation', foodDonationSchema);

