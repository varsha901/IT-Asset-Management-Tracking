const express = require('express');
const { auth, authorizeRoles } = require('../middlewares/auth');
const { listAssignments, createAssignment, returnAssignment } = require('../controllers/assignmentController');
const router = express.Router();

router.get('/', auth, listAssignments);
router.post('/', auth, authorizeRoles('IT_ADMIN', 'MANAGER'), createAssignment);
router.put('/:id/return', auth, authorizeRoles('IT_ADMIN', 'MANAGER'), returnAssignment);

module.exports = router;
