const MaintenanceTicket = require('../models/MaintenanceTicket');
const { maintenanceSchema } = require('../validators/maintenance');
const { asyncHandler } = require('../utils/asyncHandler');

const listMaintenanceTickets = asyncHandler(async (req, res) => {
  const tickets = await MaintenanceTicket.find().populate('asset').populate('requestedBy').populate('assignedTo');
  res.json(tickets);
});

const createMaintenanceTicket = asyncHandler(async (req, res) => {
  const { error, value } = maintenanceSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const ticket = await MaintenanceTicket.create({ ...value, requestedBy: req.user._id });
  res.status(201).json(ticket);
});

const updateMaintenanceTicket = asyncHandler(async (req, res) => {
  const { error, value } = maintenanceSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const ticket = await MaintenanceTicket.findByIdAndUpdate(req.params.id, value, { new: true, runValidators: true });
  if (!ticket) return res.status(404).json({ message: 'Maintenance ticket not found' });
  res.json(ticket);
});

module.exports = { listMaintenanceTickets, createMaintenanceTicket, updateMaintenanceTicket };
