const addressRepository = require('../repositories/address.repository');
const { STATUS_CODES, MESSAGES } = require('../../config/constants');

class AddressController {
  // Get user addresses
  async getUserAddresses(req, res, next) {
    try {
      const userId = req.user.id;
      const addresses = await addressRepository.getUserAddresses(userId);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data: addresses
      });
    } catch (error) {
      next(error);
    }
  }

  // Create address
  async createAddress(req, res, next) {
    try {
      const userId = req.user.id;
      const { fullName, email, phone, streetAddress, cityId, stateId, postalCode, country } = req.body;

      // Validate required fields
      if (!fullName || !streetAddress || !cityId || !stateId || !postalCode) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const addressId = await addressRepository.createAddress(
        userId, fullName, email, phone, streetAddress, cityId, stateId, postalCode, country || 'India'
      );

      const address = await addressRepository.getAddressById(addressId);

      res.status(STATUS_CODES.CREATED).json({
        success: true,
        message: 'Address created successfully',
        data: address
      });
    } catch (error) {
      next(error);
    }
  }

  // Get address by ID
  async getAddressById(req, res, next) {
    try {
      const { addressId } = req.params;
      const userId = req.user.id;

      const address = await addressRepository.getAddressById(addressId);

      if (!address) {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: 'Address not found'
        });
      }

      // Check authorization
      if (address.user_id !== userId) {
        return res.status(STATUS_CODES.FORBIDDEN).json({
          success: false,
          message: 'Not authorized to view this address'
        });
      }

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data: address
      });
    } catch (error) {
      next(error);
    }
  }

  // Update address
  async updateAddress(req, res, next) {
    try {
      const { addressId } = req.params;
      const userId = req.user.id;
      const { fullName, email, phone, streetAddress, cityId, stateId, postalCode } = req.body;

      const address = await addressRepository.getAddressById(addressId);

      if (!address) {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: 'Address not found'
        });
      }

      // Check authorization
      if (address.user_id !== userId) {
        return res.status(STATUS_CODES.FORBIDDEN).json({
          success: false,
          message: 'Not authorized to update this address'
        });
      }

      await addressRepository.updateAddress(
        addressId, fullName, email, phone, streetAddress, cityId, stateId, postalCode
      );

      const updatedAddress = await addressRepository.getAddressById(addressId);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: 'Address updated successfully',
        data: updatedAddress
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete address
  async deleteAddress(req, res, next) {
    try {
      const { addressId } = req.params;
      const userId = req.user.id;

      const address = await addressRepository.getAddressById(addressId);

      if (!address) {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: 'Address not found'
        });
      }

      // Check authorization
      if (address.user_id !== userId) {
        return res.status(STATUS_CODES.FORBIDDEN).json({
          success: false,
          message: 'Not authorized to delete this address'
        });
      }

      const deleted = await addressRepository.deleteAddress(addressId);

      if (!deleted) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'Failed to delete address'
        });
      }

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: 'Address deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Set default address
  async setDefaultAddress(req, res, next) {
    try {
      const { addressId } = req.params;
      const userId = req.user.id;

      const address = await addressRepository.getAddressById(addressId);

      if (!address) {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: 'Address not found'
        });
      }

      // Check authorization
      if (address.user_id !== userId) {
        return res.status(STATUS_CODES.FORBIDDEN).json({
          success: false,
          message: 'Not authorized to update this address'
        });
      }

      await addressRepository.setDefaultAddress(userId, addressId);

      const updatedAddress = await addressRepository.getAddressById(addressId);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: 'Default address updated',
        data: updatedAddress
      });
    } catch (error) {
      next(error);
    }
  }

  // Get default address
  async getDefaultAddress(req, res, next) {
    try {
      const userId = req.user.id;
      const address = await addressRepository.getDefaultAddress(userId);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data: address
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AddressController();
