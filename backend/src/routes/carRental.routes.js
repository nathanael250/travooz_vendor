const express = require('express');
const router = express.Router();
const carRentalSetupService = require('../services/carRental/carRentalSetup.service');

// Register or create car rental business (Step 3)
router.post('/register', async (req, res, next) => {
  try {
    const result = await carRentalSetupService.registerVendor(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Save business details (Step 4)
router.post('/business-details', async (req, res, next) => {
  try {
    const result = await carRentalSetupService.saveBusinessDetails(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Save tax & payment info (Step 5)
router.post('/tax-payment', async (req, res, next) => {
  try {
    const result = await carRentalSetupService.saveTaxPayment(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Create optional car rental listing (Step 6)
router.post('/cars', async (req, res, next) => {
  try {
    const result = await carRentalSetupService.createCarRental(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Submit agreement (Step 8)
router.post('/agreement', async (req, res, next) => {
  try {
    const result = await carRentalSetupService.submitAgreement(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Get submission status (Step 9)
router.get('/status/:carRentalBusinessId', async (req, res, next) => {
  try {
    const { carRentalBusinessId } = req.params;
    const result = await carRentalSetupService.getSubmissionStatus(carRentalBusinessId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
