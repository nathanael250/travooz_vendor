const clientPaymentService = require('../../services/client/clientPayment.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');

/**
 * Process payment for a booking
 */
const processPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const result = await clientPaymentService.processPayment(transactionId, req.body);
    return sendSuccess(res, result, 'Payment processed successfully', 200);
  } catch (error) {
    console.error('Error in processPayment:', error);
    return sendError(res, error.message || 'Failed to process payment', 400);
  }
};

/**
 * Get payment transaction details
 */
const getTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await clientPaymentService.getTransaction(transactionId);
    
    if (!transaction) {
      return sendError(res, 'Transaction not found', 404);
    }

    return sendSuccess(res, transaction, 'Transaction retrieved successfully', 200);
  } catch (error) {
    console.error('Error in getTransaction:', error);
    return sendError(res, error.message || 'Failed to get transaction', 500);
  }
};

/**
 * Verify payment status
 */
const verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const result = await clientPaymentService.verifyPayment(transactionId);
    return sendSuccess(res, result, 'Payment verified successfully', 200);
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    return sendError(res, error.message || 'Failed to verify payment', 400);
  }
};

module.exports = {
  processPayment,
  getTransaction,
  verifyPayment
};

