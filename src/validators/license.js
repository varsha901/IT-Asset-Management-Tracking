const Joi = require('joi');

const licenseSchema = Joi.object({
  name: Joi.string().required(),
  vendor: Joi.string().optional(),
  key: Joi.string().optional(),
  seats: Joi.number().min(1).optional(),
  usedSeats: Joi.number().min(0).optional(),
  startDate: Joi.date().optional(),
  expiryDate: Joi.date().optional(),
  status: Joi.string().valid('ACTIVE', 'EXPIRED', 'SUSPENDED').optional(),
  notes: Joi.string().optional()
});

module.exports = { licenseSchema };
