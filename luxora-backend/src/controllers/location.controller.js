const locationRepository = require('../repositories/location.repository');
const { STATUS_CODES, MESSAGES } = require('../../config/constants');

class LocationController {
  // Get all states
  async getStates(req, res, next) {
    try {
      const states = await locationRepository.getAllStates();
      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data: states,
        total: states.length,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get cities by state ID
  async getCitiesByStateId(req, res, next) {
    try {
      const { stateId } = req.params;

      if (!stateId) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'State ID is required',
        });
      }

      const cities = await locationRepository.getCitiesByStateId(stateId);

      // Return 200 with empty array if no cities found (don't return 404)
      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data: cities || [],
        total: cities.length,
        stateId,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get state by code
  async getStateByCode(req, res, next) {
    try {
      const { code } = req.params;

      if (!code) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'State code is required',
        });
      }

      const state = await locationRepository.getStateByCode(code);

      if (!state) {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: 'State not found',
        });
      }

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data: state,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all cities
  async getAllCities(req, res, next) {
    try {
      const cities = await locationRepository.getAllCities();

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data: cities,
        total: cities.length,
      });
    } catch (error) {
      next(error);
    }
  }

  // Search cities
  async searchCities(req, res, next) {
    try {
      const { query } = req.query;

      if (!query || query.length < 2) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'Search query must be at least 2 characters',
        });
      }

      const results = await locationRepository.searchCities(query);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data: results,
        total: results.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LocationController();
