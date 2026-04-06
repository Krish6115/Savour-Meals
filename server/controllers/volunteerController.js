const Delivery = require('../models/Delivery');
const FoodDonation = require('../models/FoodDonation');
const { sendNotification } = require('../utils/notifications');

// @desc    Get volunteer's assigned tasks
// @route   GET /api/volunteer/tasks
// @access  Private (Volunteer)
const getTasks = async (req, res) => {
  try {
    const deliveries = await Delivery.find({
      volunteerId: req.user.id,
      status: { $in: ['assigned', 'picked', 'in_transit'] }
    })
      .populate({
        path: 'donationId',
        populate: {
          path: 'donorId',
          select: 'name phone location'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: deliveries.length,
      tasks: deliveries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message || 'Server error fetching tasks'
    });
  }
};

// @desc    Update task status
// @route   PUT /api/volunteer/task/:id
// @access  Private (Volunteer)
const updateTaskStatus = async (req, res) => {
  try {
    const { status, currentLocation, otp } = req.body;
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        msg: 'Task not found'
      });
    }

    if (delivery.volunteerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        msg: 'Not authorized to update this task'
      });
    }

    const validStatuses = ['assigned', 'picked', 'in_transit', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid status'
      });
    }

    // Enforce status flow
    const statusFlow = {
      assigned: ['picked'],
      picked: ['in_transit'],
      in_transit: ['delivered'],
      delivered: []
    };

    // If attempting to change status, check if it's a valid transition
    if (delivery.status !== status) {
      const allowedNextStatuses = statusFlow[delivery.status];
      if (!allowedNextStatuses || !allowedNextStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          msg: `Invalid status transition from ${delivery.status} to ${status}`
        });
      }
    }

    // Verify OTP if marking as picked
    if (status === 'picked') {
      if (!otp) {
        return res.status(400).json({
          success: false,
          msg: 'OTP is required to confirm pickup'
        });
      }

      // Fetch the donation to check OTP
      const donation = await FoodDonation.findById(delivery.donationId);
      if (!donation) {
        return res.status(404).json({
          success: false,
          msg: 'Associated donation not found'
        });
      }

      if (otp !== donation.pickupOtp) {
        return res.status(400).json({
          success: false,
          msg: 'Invalid OTP'
        });
      }
    }

    // Update delivery status
    delivery.status = status;

    if (status === 'picked') {
      delivery.pickupTime = new Date();
    } else if (status === 'delivered') {
      delivery.deliveryTime = new Date();

      // Update food donation status
      const donation = await FoodDonation.findById(delivery.donationId);
      if (donation) {
        donation.status = 'delivered';
        await donation.save();
      }
    }

    if (currentLocation) {
      delivery.currentLocation = currentLocation;
    }

    await delivery.save();

    res.json({
      success: true,
      task: delivery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message || 'Server error updating task'
    });
  }
};

// @desc    Get volunteer's delivery history
// @route   GET /api/volunteer/history
// @access  Private (Volunteer)
const getHistory = async (req, res) => {
  try {
    const deliveries = await Delivery.find({
      volunteerId: req.user.id,
      status: 'delivered'
    })
      .populate({
        path: 'donationId',
        populate: {
          path: 'donorId',
          select: 'name phone location'
        }
      })
      .sort({ deliveryTime: -1 })
      .limit(50); // Limit to last 50 deliveries

    res.json({
      success: true,
      count: deliveries.length,
      history: deliveries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message || 'Server error fetching history'
    });
  }
};

module.exports = {
  getTasks,
  updateTaskStatus,
  getHistory
};

