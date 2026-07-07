const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedDate: { type: Date, default: Date.now },
  expectedReturnDate: { type: Date },
  returnedDate: { type: Date },
  status: { type: String, enum: ['ACTIVE', 'RETURNED', 'TRANSFERRED'], default: 'ACTIVE' },
  notes: { type: String },
  history: [{
    action: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    notes: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
