const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetTag: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['LAPTOP', 'DESKTOP', 'MONITOR', 'SERVER', 'PERIPHERAL', 'SOFTWARE_LICENSE'], required: true },
  category: { type: String, required: true },
  description: { type: String },
  manufacturer: { type: String },
  model: { type: String },
  serialNumber: { type: String },
  purchaseDate: { type: Date },
  purchaseCost: { type: Number, default: 0 },
  warrantyExpiry: { type: Date },
  status: { type: String, enum: ['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED', 'LOST'], default: 'AVAILABLE' },
  location: { type: String },
  department: { type: String },
  currentAssignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
