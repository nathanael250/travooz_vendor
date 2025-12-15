/**
 * Script to clean up test car rental bookings
 * Run with: node scripts/cleanup_test_car_bookings.js
 */

const { executeQuery } = require('../config/database');

async function cleanupTestBookings() {
  try {
    console.log('🧹 Cleaning up test car rental bookings...\n');

    // Find bookings that might be test bookings
    // (bookings with test emails, old dates, or pending status for a long time)
    const testBookings = await executeQuery(`
      SELECT 
        crb.booking_id,
        crb.car_id,
        crb.customer_name,
        crb.customer_email,
        crb.pickup_date,
        crb.dropoff_date,
        crb.booking_status,
        crb.created_at,
        b.booking_reference
      FROM car_rental_bookings crb
      JOIN bookings b ON crb.booking_id = b.booking_id
      WHERE (
        crb.customer_email LIKE '%example.com%' 
        OR crb.customer_email LIKE '%test%'
        OR crb.booking_status = 'pending'
      )
      ORDER BY crb.created_at DESC
    `);

    if (testBookings.length === 0) {
      console.log('✅ No test bookings found to clean up.');
      process.exit(0);
    }

    console.log(`📋 Found ${testBookings.length} potential test bookings:\n`);
    testBookings.forEach((booking, index) => {
      console.log(`${index + 1}. Booking #${booking.booking_id} (Ref: ${booking.booking_reference})`);
      console.log(`   Car ID: ${booking.car_id}`);
      console.log(`   Customer: ${booking.customer_name} (${booking.customer_email})`);
      console.log(`   Dates: ${booking.pickup_date} to ${booking.dropoff_date}`);
      console.log(`   Status: ${booking.booking_status}`);
      console.log(`   Created: ${booking.created_at}\n`);
    });

    // Delete specific booking #30 if it exists
    const booking30 = testBookings.find(b => b.booking_id === 30);
    if (booking30) {
      console.log('🗑️  Deleting booking #30...');
      try {
        // Delete from car_rental_bookings (cascade should handle bookings table)
        await executeQuery(
          `DELETE FROM car_rental_bookings WHERE booking_id = ?`,
          [30]
        );
        console.log('✅ Booking #30 deleted successfully!\n');
      } catch (error) {
        console.error('❌ Error deleting booking #30:', error.message);
      }
    }

    console.log('✅ Cleanup complete!');
    console.log('\n💡 To delete other bookings, you can run:');
    console.log('   DELETE FROM car_rental_bookings WHERE booking_id = <id>;');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
  process.exit(0);
}

cleanupTestBookings();













