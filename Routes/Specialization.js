const express = require('express');
const router = express.Router();
const specializationController = require('../Controllers/Specialization');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/specializations', authMiddleware, specializationController.getAllSpecializations);
router.post('/specializations', authMiddleware, specializationController.createSpecialization);
router.get('/specializations/:id', authMiddleware, specializationController.getSpecializationById);
router.put('/specializations/:id', authMiddleware, specializationController.updateSpecialization);
router.delete('/specializations/:id', authMiddleware, specializationController.deleteSpecialization);

module.exports = router;
