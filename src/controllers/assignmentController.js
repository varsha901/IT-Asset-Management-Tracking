const Assignment = require('../models/Assignment');
const Asset = require('../models/Asset');
const { asyncHandler } = require('../utils/asyncHandler');

const listAssignments = asyncHandler(async (req, res) => {
  const assignments = await Assignment.find().populate('asset').populate('assignedTo').populate('assignedBy');
  res.json(assignments);
});

const createAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.create({
    ...req.body,
    assignedBy: req.user._id
  });

  await Asset.findByIdAndUpdate(req.body.asset, { status: 'ASSIGNED', currentAssignment: assignment._id });
  res.status(201).json(assignment);
});

const returnAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findByIdAndUpdate(req.params.id, {
    status: 'RETURNED',
    returnedDate: new Date()
  }, { new: true });

  if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

  await Asset.findByIdAndUpdate(assignment.asset, { status: 'AVAILABLE', currentAssignment: null });
  res.json(assignment);
});

module.exports = { listAssignments, createAssignment, returnAssignment };
