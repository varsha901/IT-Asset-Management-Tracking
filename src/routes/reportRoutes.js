const express = require('express');
const { auth } = require('../middlewares/auth');
const { getDashboardStats, getAssetsByDepartment, getExpiringWarranties } = require('../controllers/reportController');
const router = express.Router();

router.get('/dashboard', auth, getDashboardStats);
router.get('/assets-by-department', auth, getAssetsByDepartment);
router.get('/expiring-warranties', auth, getExpiringWarranties);

module.exports = router;
