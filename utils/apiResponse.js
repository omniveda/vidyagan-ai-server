/**
 * Standardized API response utility
 * @param {boolean} success - Whether the operation was successful
 * @param {string} message - Response message
 * @param {any} data - Response data (optional)
 * @param {string} error - Error details (optional)
 * @returns {object} Standardized API response
 */
const apiResponse = (success, message, data = null, error = null) => {
  return {
    success,
    message,
    data,
    error
  };
};

module.exports = apiResponse; 