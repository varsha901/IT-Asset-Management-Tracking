const Asset = require('../models/Asset');
const { assetSchema, assetUpdateSchema } = require('../validators/asset');
const { asyncHandler } = require('../utils/asyncHandler');

const listAssets = asyncHandler(async (req, res) => {
  const assets = await Asset.find().sort({ createdAt: -1 });
  res.json(assets);
});

const createAsset = asyncHandler(async (req, res) => {
  const { error, value } = assetSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const existingAsset = await Asset.findOne({ assetTag: value.assetTag });
  if (existingAsset) return res.status(409).json({ message: 'Asset tag already exists' });

  const asset = await Asset.create(value);
  res.status(201).json(asset);
});

const getAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) return res.status(404).json({ message: 'Asset not found' });
  res.json(asset);
});

const updateAsset = asyncHandler(async (req, res) => {
  const { error, value } = assetUpdateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const asset = await Asset.findByIdAndUpdate(req.params.id, value, { new: true, runValidators: true });
  if (!asset) return res.status(404).json({ message: 'Asset not found' });
  res.json(asset);
});

const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findByIdAndDelete(req.params.id);
  if (!asset) return res.status(404).json({ message: 'Asset not found' });
  res.json({ message: 'Asset deleted' });
});

module.exports = { listAssets, createAsset, getAsset, updateAsset, deleteAsset };
