const express = require('express');
const { auth, authorizeRoles } = require('../middlewares/auth');
const { listLicenses, createLicense, updateLicense } = require('../controllers/licenseController');
const router = express.Router();

router.get('/', auth, listLicenses);
router.post('/', auth, authorizeRoles('IT_ADMIN'), createLicense);
router.put('/:id', auth, authorizeRoles('IT_ADMIN'), updateLicense);

module.exports = router;
