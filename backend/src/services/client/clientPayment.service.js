const { executeQuery } = require('../../../config/database');

class ClientPaymentService {
  /**
   * Process payment for a booking
   */
  async processPayment(transactionId, paymentData) {
    try {
      const {
        payment_gateway_id,
        gateway_response,
        payment_status = 'completed'
      } = paymentData;

      // Get transaction details
      const transactions = await executeQuery(
        `SELECT * FROM payment_transactions WHERE transaction_id = ?`,
        [transactionId]
      );

      if (!transactions || transactions.length === 0) {
        throw new Error('Transaction not found');
      }

      const transaction = transactions[0];

      if (transaction.status !== 'pending') {
        throw new Error('Transaction already processed');
      }

      // Update transaction
      await executeQuery(
        `UPDATE payment_transactions 
         SET status = ?, payment_gateway_id = ?, gateway_response = ?, updated_at = NOW()
         WHERE transaction_id = ?`,
        [payment_status, payment_gateway_id, gateway_response ? JSON.stringify(gateway_response) : null, transactionId]
      );

      // Update booking status
      if (payment_status === 'completed') {
        await executeQuery(
          `UPDATE bookings 
           SET status = 'confirmed', payment_status = 'paid', confirmed_at = NOW()
           WHERE booking_id = ?`,
          [transaction.booking_id]
        );

        // Update service-specific booking status
        const booking = await executeQuery(
          `SELECT service_type FROM bookings WHERE booking_id = ?`,
          [transaction.booking_id]
        );

        if (booking && booking.length > 0) {
          const serviceType = booking[0].service_type;

          if (serviceType === 'room') {
            await executeQuery(
              `UPDATE room_bookings SET status = 'confirmed' WHERE booking_id = ?`,
              [transaction.booking_id]
            );
          } else if (serviceType === 'tour_package') {
            await executeQuery(
              `UPDATE tour_bookings SET status = 'confirmed' WHERE booking_id = ?`,
              [transaction.booking_id]
            );
          } else if (serviceType === 'restaurant_table') {
            await executeQuery(
              `UPDATE restaurant_reservations SET status = 'confirmed' WHERE booking_id = ?`,
              [transaction.booking_id]
            );
          } else if (serviceType === 'car_rental') {
            await executeQuery(
              `UPDATE car_rental_bookings SET booking_status = 'confirmed' WHERE booking_id = ?`,
              [transaction.booking_id]
            );
          }
        }
      }

      return {
        transaction_id: transactionId,
        status: payment_status,
        booking_id: transaction.booking_id
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Get payment transaction details
   */
  async getTransaction(transactionId) {
    try {
      const transactions = await executeQuery(
        `SELECT pt.*, b.booking_reference, b.service_type, b.total_amount
         FROM payment_transactions pt
         JOIN bookings b ON pt.booking_id = b.booking_id
         WHERE pt.transaction_id = ?`,
        [transactionId]
      );

      if (!transactions || transactions.length === 0) {
        return null;
      }

      return transactions[0];
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw error;
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(transactionId) {
    try {
      const transaction = await this.getTransaction(transactionId);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return {
        transaction_id: transactionId,
        status: transaction.status,
        payment_status: transaction.status,
        booking_reference: transaction.booking_reference,
        amount: transaction.amount
      };
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }
}

module.exports = new ClientPaymentService();

