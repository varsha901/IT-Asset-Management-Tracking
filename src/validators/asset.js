const Joi = require('joi');

const assetBaseSchema = Joi.object({
  assetTag: Joi.string(),
  name: Joi.string(),
  type: Joi.string().valid('LAPTOP', 'DESKTOP', 'MONITOR', 'SERVER', 'PERIPHERAL', 'SOFTWARE_LICENSE'),
  category: Joi.string(),
  description: Joi.string().optional(),
  manufacturer: Joi.string().optional(),
  model: Joi.string().optional(),
  serialNumber: Joi.string().optional(),
  purchaseDate: Joi.date().optional(),
  purchaseCost: Joi.number().optional(),
  warrantyExpiry: Joi.date().optional(),
  status: Joi.string().valid('AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED', 'LOST').optional(),
  location: Joi.string().optional(),
  department: Joi.string().optional(),
  notes: Joi.string().optional()
});

const assetSchema = assetBaseSchema.keys({
  assetTag: Joi.string().required(),
  name: Joi.string().required(),
  type: Joi.string().valid('LAPTOP', 'DESKTOP', 'MONITOR', 'SERVER', 'PERIPHERAL', 'SOFTWARE_LICENSE').required(),
  category: Joi.string().required()
});

const assetUpdateSchema = assetBaseSchema.min(1);

module.exports = { assetSchema, assetUpdateSchema };
