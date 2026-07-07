const express = require('express');
const { auth } = require('../middlewares/auth');
const { listMaintenanceTickets, createMaintenanceTicket, updateMaintenanceTicket } = require('../controllers/maintenanceController');
const router = express.Router();

router.get('/', auth, listMaintenanceTickets);
router.post('/', auth, createMaintenanceTicket);
router.put('/:id', auth, updateMaintenanceTicket);

module.exports = router;
