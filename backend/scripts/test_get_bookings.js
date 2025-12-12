const bookingsService = require('../src/services/carRental/bookings.service');

(async () => {
  try {
    const vendorId = process.argv[2] || process.env.TEST_VENDOR_ID || 1;
    console.log('Testing getBookingsByVendor for vendorId:', vendorId);
    const bookings = await bookingsService.getBookingsByVendor(vendorId, { limit: 5 });
    console.log('Bookings result:', JSON.stringify(bookings, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error running test_get_bookings:', err);
    process.exit(2);
  }
})();
