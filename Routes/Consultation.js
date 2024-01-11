const express = require('express');
const router = express.Router();
const consultationController = require('../Controllers/Consultation');
const authMiddleware = require('../middleware/authMiddleware');

// Existing routes for consultations
router.get('/consultations',authMiddleware, consultationController.getAllConsultations);
router.get('/consultations/:id',authMiddleware, consultationController.getConsultationById);
router.post('/consultations', consultationController.createConsultation);
router.put('/consultations/:id',authMiddleware, consultationController.updateConsultation);
router.delete('/consultations/:id',authMiddleware, consultationController.deleteConsultation);
router.get('/files/:fileName', consultationController.getFileByName);

module.exports = router;
