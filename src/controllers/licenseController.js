const License = require('../models/License');
const { licenseSchema } = require('../validators/license');
const { asyncHandler } = require('../utils/asyncHandler');

const listLicenses = asyncHandler(async (req, res) => {
  const licenses = await License.find().sort({ expiryDate: 1 });
  res.json(licenses);
});

const createLicense = asyncHandler(async (req, res) => {
  const { error, value } = licenseSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const license = await License.create(value);
  res.status(201).json(license);
});

const updateLicense = asyncHandler(async (req, res) => {
  const { error, value } = licenseSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const license = await License.findByIdAndUpdate(req.params.id, value, { new: true, runValidators: true });
  if (!license) return res.status(404).json({ message: 'License not found' });
  res.json(license);
});

module.exports = { listLicenses, createLicense, updateLicense };
