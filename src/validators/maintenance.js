const Joi = require('joi');

const maintenanceSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  asset: Joi.string().required(),
  assignedTo: Joi.string().optional(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').optional(),
  status: Joi.string().valid('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED').optional(),
  dueDate: Joi.date().optional(),
  resolution: Joi.string().optional()
});

module.exports = { maintenanceSchema };
