const Asset = require('../models/Asset');
const License = require('../models/License');
const { asyncHandler } = require('../utils/asyncHandler');

const getDashboardStats = asyncHandler(async (req, res) => {
  const totalAssets = await Asset.countDocuments();
  const assignedAssets = await Asset.countDocuments({ status: 'ASSIGNED' });
  const maintenanceAssets = await Asset.countDocuments({ status: 'MAINTENANCE' });
  const expiringLicenses = await License.countDocuments({ expiryDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });

  res.json({ totalAssets, assignedAssets, maintenanceAssets, expiringLicenses });
});

const getAssetsByDepartment = asyncHandler(async (req, res) => {
  const stats = await Asset.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
  res.json(stats);
});

const getExpiringWarranties = asyncHandler(async (req, res) => {
  const warranties = await Asset.find({ warrantyExpiry: { $lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) } }).sort('warrantyExpiry');
  res.json(warranties);
});

module.exports = { getDashboardStats, getAssetsByDepartment, getExpiringWarranties };
