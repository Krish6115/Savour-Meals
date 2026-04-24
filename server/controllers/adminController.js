const User = require('../models/User');
const FoodDonation = require('../models/FoodDonation');
const Delivery = require('../models/Delivery');

// @desc    Get all users with optional filters
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const { role, verified, search } = req.query;
    const filter = {};

    if (role && role !== 'all') filter.role = role;
    if (verified !== undefined && verified !== '') filter.verified = verified === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message || 'Server error fetching users'
    });
  }
};

// @desc    Update a user (verify, change role, etc.)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
  try {
    const { verified, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }

    // Prevent admin from modifying their own role
    if (req.user.id === req.params.id && role && role !== user.role) {
      return res.status(400).json({
        success: false,
        msg: 'Cannot modify your own role'
      });
    }

    if (verified !== undefined) user.verified = verified;
    if (role && ['donor', 'ngo', 'volunteer', 'admin'].includes(role)) user.role = role;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        phone: user.phone,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message || 'Server error updating user'
    });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        msg: 'Cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      msg: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message || 'Server error deleting user'
    });
  }
};

// @desc    Get all donations with optional filters
// @route   GET /api/admin/donations
// @access  Private (Admin)
const getDonations = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.foodType = { $regex: search, $options: 'i' };
    }

    const donations = await FoodDonation.find(filter)
      .populate('donorId', 'name email phone')
      .populate('ngoId', 'name organizationName email')
      .populate('volunteerId', 'name phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: donations.length,
      donations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message || 'Server error fetching donations'
    });
  }
};

// @desc    Get aggregated analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAnalytics = async (req, res) => {
  try {
    // Users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Donations by status
    const donationsByStatus = await FoodDonation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Donations over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const donationsOverTime = await FoodDonation.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top donors (by number of donations)
    const topDonors = await FoodDonation.aggregate([
      { $group: { _id: '$donorId', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'donor'
        }
      },
      { $unwind: '$donor' },
      {
        $project: {
          name: '$donor.name',
          email: '$donor.email',
          count: 1,
          totalQuantity: 1
        }
      }
    ]);

    // Average delivery time (in minutes)
    const deliveryTimes = await Delivery.aggregate([
      { $match: { status: 'delivered', pickupTime: { $exists: true }, deliveryTime: { $exists: true } } },
      {
        $project: {
          deliveryDuration: {
            $divide: [
              { $subtract: ['$deliveryTime', '$pickupTime'] },
              60000 // Convert ms to minutes
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDeliveryTime: { $avg: '$deliveryDuration' },
          totalDeliveries: { $sum: 1 }
        }
      }
    ]);

    // Total counts
    const totalUsers = await User.countDocuments();
    const totalDonations = await FoodDonation.countDocuments();
    const totalDelivered = await FoodDonation.countDocuments({ status: 'delivered' });
    const totalServings = await FoodDonation.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    res.json({
      success: true,
      analytics: {
        overview: {
          totalUsers,
          totalDonations,
          totalDelivered,
          totalServings: totalServings[0]?.total || 0,
          successRate: totalDonations > 0 ? ((totalDelivered / totalDonations) * 100).toFixed(1) : 0,
          avgDeliveryTime: deliveryTimes[0]?.avgDeliveryTime?.toFixed(1) || 'N/A'
        },
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        donationsByStatus: donationsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        donationsOverTime,
        topDonors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message || 'Server error fetching analytics'
    });
  }
};

module.exports = {
  getUsers,
  updateUser,
  deleteUser,
  getDonations,
  getAnalytics
};
