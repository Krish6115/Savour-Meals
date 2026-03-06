const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please provide a name'] 
  },
  email: { 
    type: String, 
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: { 
    type: String, 
    enum: ['donor', 'ngo', 'volunteer', 'admin'],
    required: [true, 'Please provide a role']
  },
  phone: { 
    type: String, 
    required: [true, 'Please provide a phone number']
  },
  location: {
    address: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  organizationName: { 
    type: String 
  }, // for NGOs
  verified: { 
    type: Boolean, 
    default: false 
  },
  fcmToken: {
    type: String // For push notifications
  }
}, { 
  timestamps: true 
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

