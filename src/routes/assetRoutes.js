const express = require('express');
const { auth, authorizeRoles } = require('../middlewares/auth');
const { listAssets, createAsset, getAsset, updateAsset, deleteAsset } = require('../controllers/assetController');
const router = express.Router();

router.get('/', auth, listAssets);
router.post('/', auth, authorizeRoles('IT_ADMIN', 'MANAGER'), createAsset);
router.get('/:id', auth, getAsset);
router.put('/:id', auth, authorizeRoles('IT_ADMIN', 'MANAGER'), updateAsset);
router.delete('/:id', auth, authorizeRoles('IT_ADMIN'), deleteAsset);

module.exports = router;
