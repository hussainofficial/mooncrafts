const express = require('express');
const { param, query } = require('express-validator');
const locationController = require('../controllers/location.controller');

const router = express.Router();

// Get all states
router.get('/states', locationController.getStates);

// Get state by code (MUST be before :stateId routes)
router.get(
  '/states/code/:code',
  [param('code').notEmpty().withMessage('State code is required')],
  locationController.getStateByCode
);

// Get cities by state ID (database ID)
router.get(
  '/states/:stateId/cities',
  [param('stateId').isInt().withMessage('State ID must be a number')],
  locationController.getCitiesByStateId
);

// Get all cities
router.get('/cities', locationController.getAllCities);

// Search cities
router.get(
  '/search',
  [query('query').notEmpty().isLength({ min: 2 }).withMessage('Search query must be at least 2 characters')],
  locationController.searchCities
);

module.exports = router;
