const mongoose = require('mongoose');

const licenseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vendor: { type: String },
  key: { type: String },
  seats: { type: Number, default: 1 },
  usedSeats: { type: Number, default: 0 },
  startDate: { type: Date },
  expiryDate: { type: Date },
  status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'SUSPENDED'], default: 'ACTIVE' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('License', licenseSchema);
