const FoodDonation = require('../models/FoodDonation');
const User = require('../models/User');
const Delivery = require('../models/Delivery');
const { sendNotification } = require('../utils/notifications');

// @desc    Get all requests for NGO
// @route   GET /api/ngo/requests
// @access  Private (NGO)
const getRequests = async (req, res) => {
  try {
    const requests = await FoodDonation.find({
      $or: [
        { status: 'pending', expiryTime: { $gt: new Date() } },
        { ngoId: req.user.id }
      ]
    })
      .populate('donorId', 'name phone location')
      .populate('volunteerId', 'name phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message || 'Server error fetching requests'
    });
  }
};

// @desc    Assign volunteer to a donation
// @route   POST /api/ngo/assign/:donationId
// @access  Private (NGO)
const assignVolunteer = async (req, res) => {
  try {
    const { volunteerId, deliveryAddress } = req.body;
    const { donationId } = req.params;

    const donation = await FoodDonation.findById(donationId);

    if (!donation) {
      return res.status(404).json({
        success: false,
        msg: 'Donation not found'
      });
    }

    if (donation.ngoId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        msg: 'Not authorized to assign volunteers to this donation'
      });
    }

    if (donation.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        msg: 'Donation must be accepted before assigning volunteer'
      });
    }

    // Verify volunteer exists and has volunteer role
    const volunteer = await User.findById(volunteerId);
    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(400).json({
        success: false,
        msg: 'Invalid volunteer'
      });
    }

    donation.volunteerId = volunteerId;
    await donation.save();

    // Generate 4-digit OTP
    const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // Create delivery record
    const delivery = await Delivery.create({
      donationId,
      volunteerId,
      deliveryAddress,
      status: 'assigned',
      pickupOtp
    });

    // Notify volunteer
    if (volunteer.fcmToken) {
      await sendNotification(
        volunteer.fcmToken,
        'New Delivery Assignment',
        `You have been assigned to deliver ${donation.foodType} (${donation.quantity} people)`,
        {
          donationId: donation._id.toString(),
          deliveryId: delivery._id.toString(),
          type: 'volunteer_assigned'
        }
      );
    }

    res.json({
      success: true,
      donation,
      delivery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message || 'Server error assigning volunteer'
    });
  }
};

// @desc    Get available volunteers
// @route   GET /api/ngo/volunteers
// @access  Private (NGO)
const getVolunteers = async (req, res) => {
  try {
    const volunteers = await User.find({
      role: 'volunteer'
    }).select('name email phone location');

    console.log(`Found ${volunteers.length} volunteers:`, volunteers);

    res.json({
      success: true,
      count: volunteers.length,
      volunteers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message || 'Server error fetching volunteers'
    });
  }
};

module.exports = {
  getRequests,
  assignVolunteer,
  getVolunteers
};

