import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './context/LanguageContext';

// Vendor Landing
import VendorLanding from './pages/vendor/VendorLanding';

// Auth Pages
import ServiceSelection from './pages/auth/ServiceSelection';

// Client Auth Pages
import ClientRegister from './pages/client/ClientRegister';
import ClientLogin from './pages/client/ClientLogin';
import ClientAccount from './pages/client/ClientAccount';

// Restaurant Pages
import ListYourRestaurant from './pages/restaurant/ListYourRestaurant';
import ListYourRestaurantStep2 from './pages/restaurant/ListYourRestaurantStep2';
import ListYourRestaurantStep3 from './pages/restaurant/ListYourRestaurantStep3';
import RestaurantEmailVerification from './pages/restaurant/EmailVerification';
import BusinessDetailsStep from './pages/restaurant/BusinessDetailsStep';
import MediaStep from './pages/restaurant/MediaStep';
import PaymentsPricingStep from './pages/restaurant/PaymentsPricingStep';
import CapacityStep from './pages/restaurant/CapacityStep';
import TaxLegalStep from './pages/restaurant/TaxLegalStep';
import MenuSetupStep from './pages/restaurant/MenuSetupStep';
import ReviewRestaurantStep from './pages/restaurant/ReviewRestaurantStep';
import AgreementStep from './pages/restaurant/AgreementStep';
import SetupComplete from './pages/restaurant/SetupComplete';
import RestaurantLogin from './pages/restaurant/Login';

// Stays Pages
import ListYourProperty from './pages/stays/ListYourProperty';
import ListYourPropertyStep2 from './pages/stays/ListYourPropertyStep2';
import ListYourPropertyStep3 from './pages/stays/ListYourPropertyStep3';
import EmailVerification from './pages/stays/EmailVerification';
import StaysLogin from './pages/stays/Login';
import StaysForgotPassword from './pages/stays/ForgotPassword';
import StaysResetPassword from './pages/stays/ResetPassword';
import ToursForgotPassword from './pages/tours/ForgotPassword';
import ToursResetPassword from './pages/tours/ResetPassword';
import CarRentalForgotPassword from './pages/car-rental/ForgotPassword';
import CarRentalResetPassword from './pages/car-rental/ResetPassword';
import RestaurantForgotPassword from './pages/restaurant/ForgotPassword';
import RestaurantResetPassword from './pages/restaurant/ResetPassword';
import ContractStep from './pages/stays/ContractStep';
import PoliciesAndSettingsStep from './pages/stays/PoliciesAndSettingsStep';
import PropertyAmenitiesStep from './pages/stays/PropertyAmenitiesStep';
import RoomsAndRatesStep from './pages/stays/RoomsAndRatesStep';
import SetUpRoomStep from './pages/stays/SetUpRoomStep';
import RoomAmenitiesStep from './pages/stays/RoomAmenitiesStep';
import ReviewRoomNameStep from './pages/stays/ReviewRoomNameStep';
import PricingModelStep from './pages/stays/PricingModelStep';
import BaseRateStep from './pages/stays/BaseRateStep';
import RatePlansStep from './pages/stays/RatePlansStep';
import PromoteListingStep from './pages/stays/PromoteListingStep';
import ImageManagementStep from './pages/stays/ImageManagementStep';
import TaxesStep from './pages/stays/TaxesStep';
import ConnectivitySettingsStep from './pages/stays/ConnectivitySettingsStep';
import ReviewListingStep from './pages/stays/ReviewListingStep';
import SubmitListingStep from './pages/stays/SubmitListingStep';
import SetupInProgress from './pages/stays/SetupInProgress';
import StaysDashboard from './pages/stays/Dashboard';
import MyProperty from './pages/stays/MyPropertyTabbed';
import RoomAvailability from './pages/stays/RoomAvailability';
import StaysBookings from './pages/stays/Bookings';
import StaysFinance from './pages/stays/Finance';
import PropertyImages from './pages/stays/PropertyImages';
import StaysDashboardLayout from './components/stays/StaysDashboardLayout';

// Restaurant Dashboard Pages
import RestaurantDashboard from './pages/restaurant/Dashboard';
// POS temporarily disabled - system is for online orders only
// import RestaurantPOS from './pages/restaurant/POS';
import Restaurants from './pages/restaurant/Restaurants';
import RestaurantGallery from './pages/restaurant/RestaurantGallery';
import RestaurantOrders from './pages/restaurant/Orders';
import OrderDetails from './pages/restaurant/OrderDetails';
import RestaurantMenuItems from './pages/restaurant/MenuItems';
import CreateMenu from './pages/restaurant/CreateMenu';
import RestaurantReports from './pages/restaurant/Reports';
import RestaurantAPIDocs from './pages/restaurant/APIDocs';
import TableBookings from './pages/restaurant/TableBookings';
import RestaurantDashboardLayout from './components/restaurant/RestaurantDashboardLayout';
import OrderFood from './pages/restaurant/OrderFood';

// Tour Package Setup Pages
import ListYourTour from './pages/tours/ListYourTour';
import ListYourTourStep2 from './pages/tours/ListYourTourStep2';
import ListYourTourStep3 from './pages/tours/ListYourTourStep3';

// Car Rental Setup Pages
import ListYourCarRental from './pages/car-rental/ListYourCarRental';
import ListYourCarRentalStep2 from './pages/car-rental/ListYourCarRentalStep2';
import ListYourCarRentalStep3 from './pages/car-rental/ListYourCarRentalStep3';
import CarRentalBusinessDetailsStep from './pages/car-rental/BusinessDetailsStep';
import CarRentalTaxPaymentStep from './pages/car-rental/TaxPaymentStep';
import ReviewCarRentalDataStep from './pages/car-rental/ReviewCarRentalDataStep';
import CarRentalAgreementStep from './pages/car-rental/AgreementStep';
import CarRentalSetupComplete from './pages/car-rental/SetupComplete';
import CarRentalDashboardLayout from './components/car-rental/CarRentalDashboardLayout';
import CarRentalDashboardOverview from './pages/car-rental/dashboard/DashboardOverview';
import CarRentalCars from './pages/car-rental/dashboard/Cars';
import CarRentalDrivers from './pages/car-rental/dashboard/Drivers';
import CarRentalAvailability from './pages/car-rental/dashboard/Availability';
import CarRentalPricing from './pages/car-rental/dashboard/Pricing';
import CarRentalBookings from './pages/car-rental/dashboard/Bookings';
import CarRentalLocations from './pages/car-rental/dashboard/Locations';
import CarRentalAnalytics from './pages/car-rental/dashboard/Analytics';
import CarRentalReviews from './pages/car-rental/dashboard/Reviews';
import CarRentalFinance from './pages/car-rental/dashboard/Finance';
import CarRentalPayments from './pages/car-rental/dashboard/Payments';
import CarRentalSettings from './pages/car-rental/dashboard/Settings';
import CarRentalSecurity from './pages/car-rental/dashboard/Security';
import CarRentalSupport from './pages/car-rental/dashboard/Support';
import CarRentalLogin from './pages/car-rental/Login';
import TourEmailVerification from './pages/tours/EmailVerification';
import BusinessOwnerInfoStep from './pages/tours/BusinessOwnerInfoStep';
import ProveIdentityStep from './pages/tours/ProveIdentityStep';
import ProveBusinessStep from './pages/tours/ProveBusinessStep';
import ReviewTourDataStep from './pages/tours/ReviewTourDataStep';
import SubmitStep from './pages/tours/SubmitStep';
import TourSetupComplete from './pages/tours/SetupComplete';
import TourDashboard from './pages/tours/Dashboard';
import ToursLogin from './pages/tours/Login';

// Tour Dashboard Layout and Pages
import TourDashboardLayout from './components/tours/TourDashboardLayout';
import DashboardOverview from './pages/tours/dashboard/DashboardOverview';
import MyTourPackages from './pages/tours/dashboard/MyTourPackages';
import SchedulesAvailability from './pages/tours/dashboard/SchedulesAvailability';
import PricingOffers from './pages/tours/dashboard/PricingOffers';
import Bookings from './pages/tours/dashboard/Bookings';
import Participants from './pages/tours/dashboard/Participants';
import MediaLibrary from './pages/tours/dashboard/MediaLibrary';
import ReportsAnalytics from './pages/tours/dashboard/ReportsAnalytics';
import ReviewsRatings from './pages/tours/dashboard/ReviewsRatings';
import AccountSettings from './pages/tours/dashboard/AccountSettings';
import SecurityAccess from './pages/tours/dashboard/SecurityAccess';
import Finance from './pages/tours/dashboard/Finance';
import SupportHelp from './pages/tours/dashboard/SupportHelp';
import CreateTourPackage from './pages/tours/dashboard/CreateTourPackage';
import ViewTourPackage from './pages/tours/dashboard/ViewTourPackage';

// Admin Pages
import TourApprovals from './pages/admin/TourApprovals';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAccountDetails from './pages/admin/AdminAccountDetails';
import AdminPackages from './pages/admin/AdminPackages';
import StaysPropertyDetails from './pages/admin/StaysPropertyDetails';

// API Documentation (Public)
import APIDocumentation from './pages/api-docs/APIDocumentation';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          
          <Routes>
          {/* Vendor Landing Page */}
          <Route path="/" element={<VendorLanding />} />
          <Route path="/vendor" element={<VendorLanding />} />

          {/* Auth Pages */}
          <Route path="/auth/service-selection" element={<ServiceSelection />} />

          {/* Client Auth */}
          <Route path="/client/register" element={<ClientRegister />} />
          <Route path="/client/login" element={<ClientLogin />} />
          <Route path="/client/account" element={<ClientAccount />} />

          {/* Restaurant Listing Flow */}
          <Route path="/restaurant/list-your-restaurant" element={<ListYourRestaurant />} />
          <Route path="/restaurant/list-your-restaurant/step-2" element={<ListYourRestaurantStep2 />} />
          <Route path="/restaurant/list-your-restaurant/step-3" element={<ListYourRestaurantStep3 />} />
          
          {/* Restaurant Email Verification */}
          <Route path="/restaurant/setup/email-verification" element={<RestaurantEmailVerification />} />
          
          {/* Restaurant Setup Flow */}
          <Route path="/restaurant/setup/business-details" element={<BusinessDetailsStep />} />
          <Route path="/restaurant/setup/media" element={<MediaStep />} />
          <Route path="/restaurant/setup/payments-pricing" element={<PaymentsPricingStep />} />
          <Route path="/restaurant/setup/capacity" element={<CapacityStep />} />
          <Route path="/restaurant/setup/tax-legal" element={<TaxLegalStep />} />
          <Route path="/restaurant/setup/menu" element={<MenuSetupStep />} />
          <Route path="/restaurant/setup/review" element={<ReviewRestaurantStep />} />
          <Route path="/restaurant/setup/agreement" element={<AgreementStep />} />
          <Route path="/restaurant/setup/complete" element={<SetupComplete />} />

          {/* Restaurant Login */}
          <Route path="/restaurant/login" element={<RestaurantLogin />} />
          <Route path="/restaurant/forgot-password" element={<RestaurantForgotPassword />} />
          <Route path="/restaurant/reset-password" element={<RestaurantResetPassword />} />

          {/* Client-facing Restaurant Ordering */}
          <Route path="/restaurant/:restaurantId/order" element={<OrderFood />} />

          {/* Stays Listing Flow */}
          <Route path="/stays/list-your-property" element={<ListYourProperty />} />
          <Route path="/stays/list-your-property/step-2" element={<ListYourPropertyStep2 />} />
          <Route path="/stays/list-your-property/step-3" element={<ListYourPropertyStep3 />} />
          <Route path="/stays/list-your-property/verify-email" element={<EmailVerification />} />
          
          {/* Stays Login */}
          <Route path="/stays/login" element={<StaysLogin />} />
          <Route path="/stays/forgot-password" element={<StaysForgotPassword />} />
          <Route path="/stays/reset-password" element={<StaysResetPassword />} />
          
          {/* Stays Setup Flow */}
          <Route path="/stays/setup/contract" element={<ContractStep />} />
          <Route path="/stays/setup/policies" element={<PoliciesAndSettingsStep />} />
          <Route path="/stays/setup/amenities" element={<PropertyAmenitiesStep />} />
          <Route path="/stays/setup/rooms" element={<RoomsAndRatesStep />} />
          <Route path="/stays/setup/room-setup" element={<SetUpRoomStep />} />
          <Route path="/stays/setup/room-amenities" element={<RoomAmenitiesStep />} />
          <Route path="/stays/setup/review-room-name" element={<ReviewRoomNameStep />} />
          <Route path="/stays/setup/pricing-model" element={<PricingModelStep />} />
          <Route path="/stays/setup/base-rate" element={<BaseRateStep />} />
          <Route path="/stays/setup/rate-plans" element={<RatePlansStep />} />
          <Route path="/stays/setup/promote-listing" element={<PromoteListingStep />} />
          <Route path="/stays/setup/images" element={<ImageManagementStep />} />
          <Route path="/stays/setup/taxes" element={<TaxesStep />} />
          <Route path="/stays/setup/connectivity" element={<ConnectivitySettingsStep />} />
          <Route path="/stays/setup/review" element={<ReviewListingStep />} />
          <Route path="/stays/setup/submit" element={<SubmitListingStep />} />
          <Route path="/stays/setup/in-progress" element={<SetupInProgress />} />
          
          {/* Stays Dashboard - Nested Routes with Layout */}
          <Route path="/stays/dashboard" element={<StaysDashboardLayout />}>
            <Route index element={<StaysDashboard />} />
            <Route path="my-property" element={<MyProperty />} />
            <Route path="bookings" element={<StaysBookings />} />
            <Route path="room-availability" element={<RoomAvailability />} />
            <Route path="finance" element={<StaysFinance />} />
            <Route path="property-images" element={<PropertyImages />} />
          </Route>

          {/* Restaurant Dashboard - Nested Routes with Layout */}
          <Route path="/restaurant" element={<RestaurantDashboardLayout />}>
            <Route index element={<Navigate to="/restaurant/dashboard" replace />} />
            <Route path="dashboard" element={<RestaurantDashboard />} />
            {/* POS temporarily disabled - system is for online orders only */}
            {/* <Route path="pos" element={<RestaurantPOS />} /> */}
            <Route path="restaurants" element={<Restaurants />} />
            <Route path="gallery" element={<RestaurantGallery />} />
            <Route path="menu-items" element={<RestaurantMenuItems />} />
            <Route path="menu-items/create" element={<CreateMenu />} />
            <Route path="orders" element={<RestaurantOrders />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="table-bookings" element={<TableBookings />} />
            <Route path="reports" element={<RestaurantReports />} />
            <Route path="api-docs" element={<RestaurantAPIDocs />} />
          </Route>

          {/* Tour Package Listing Flow */}
          <Route path="/tours/list-your-tour" element={<ListYourTour />} />
          <Route path="/tours/list-your-tour/step-2" element={<ListYourTourStep2 />} />
          <Route path="/tours/list-your-tour/step-3" element={<ListYourTourStep3 />} />

          {/* Car Rental Listing Flow */}
          <Route path="/car-rental/list-your-car-rental" element={<ListYourCarRental />} />
          <Route path="/car-rental/list-your-car-rental/step-2" element={<ListYourCarRentalStep2 />} />
          <Route path="/car-rental/list-your-car-rental/step-3" element={<ListYourCarRentalStep3 />} />

          {/* Tour Package Setup Flow */}
          <Route path="/tours/setup/email-verification" element={<TourEmailVerification />} />
          <Route path="/tours/setup/business-owner-info" element={<BusinessOwnerInfoStep />} />
          <Route path="/tours/setup/prove-identity" element={<ProveIdentityStep />} />
          <Route path="/tours/setup/prove-business" element={<ProveBusinessStep />} />
          <Route path="/tours/setup/review" element={<ReviewTourDataStep />} />
          <Route path="/tours/setup/submit" element={<SubmitStep />} />
          <Route path="/tours/setup/complete" element={<TourSetupComplete />} />

          {/* Tour Login */}
          <Route path="/tours/login" element={<ToursLogin />} />
          <Route path="/tours/forgot-password" element={<ToursForgotPassword />} />
          <Route path="/tours/reset-password" element={<ToursResetPassword />} />

          {/* Car Rental Login */}
          <Route path="/car-rental/login" element={<CarRentalLogin />} />
          <Route path="/car-rental/forgot-password" element={<CarRentalForgotPassword />} />
          <Route path="/car-rental/reset-password" element={<CarRentalResetPassword />} />

          {/* Car Rental Setup Flow */}
          <Route path="/car-rental/setup/business-details" element={<CarRentalBusinessDetailsStep />} />
          <Route path="/car-rental/setup/tax-payment" element={<CarRentalTaxPaymentStep />} />
          <Route path="/car-rental/setup/review" element={<ReviewCarRentalDataStep />} />
          <Route path="/car-rental/setup/agreement" element={<CarRentalAgreementStep />} />
          <Route path="/car-rental/setup/complete" element={<CarRentalSetupComplete />} />

          {/* Car Rental Dashboard - Nested Routes with Layout */}
          <Route path="/car-rental/dashboard" element={<CarRentalDashboardLayout />}>
            <Route index element={<CarRentalDashboardOverview />} />
            <Route path="cars" element={<CarRentalCars />} />
            <Route path="drivers" element={<CarRentalDrivers />} />
            <Route path="availability" element={<CarRentalAvailability />} />
            <Route path="pricing" element={<CarRentalPricing />} />
            <Route path="bookings" element={<CarRentalBookings />} />
            <Route path="locations" element={<CarRentalLocations />} />
            <Route path="analytics" element={<CarRentalAnalytics />} />
            <Route path="reviews" element={<CarRentalReviews />} />
            <Route path="finance" element={<CarRentalFinance />} />
            <Route path="payments" element={<CarRentalPayments />} />
            <Route path="settings" element={<CarRentalSettings />} />
            <Route path="security" element={<CarRentalSecurity />} />
            <Route path="support" element={<CarRentalSupport />} />
          </Route>

          {/* Tour Package Creation Flow - Standalone Pages */}
          <Route path="/tours/dashboard/packages/create/:packageId?" element={<CreateTourPackage />} />

          {/* Tour Dashboard - Nested Routes with Layout */}
          <Route path="/tours/dashboard" element={<TourDashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="packages" element={<MyTourPackages />} />
            <Route path="packages/:packageId" element={<ViewTourPackage />} />
            <Route path="schedules" element={<SchedulesAvailability />} />
            <Route path="pricing" element={<PricingOffers />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="participants" element={<Participants />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="analytics" element={<ReportsAnalytics />} />
            <Route path="reviews" element={<ReviewsRatings />} />
            <Route path="finance" element={<Finance />} />
            <Route path="settings" element={<AccountSettings />} />
            <Route path="security" element={<SecurityAccess />} />
            <Route path="support" element={<SupportHelp />} />
          </Route>
          
          {/* Legacy Dashboard Route - Redirect to new dashboard */}
          <Route path="/tours/dashboard/old" element={<TourDashboard />} />

          {/* Admin Pages */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/accounts/stays/:accountId" element={<StaysPropertyDetails />} />
          <Route path="/admin/accounts/:serviceType/:accountId" element={<AdminAccountDetails />} />
          <Route path="/admin/packages" element={<AdminPackages />} />
          <Route path="/admin/tour-approvals" element={<TourApprovals />} />
          <Route path="/admin/tour-approvals/:id" element={<TourApprovals />} />

          {/* Public API Documentation */}
          <Route path="/api-docs" element={<APIDocumentation />} />
          <Route path="/api/documentation" element={<APIDocumentation />} />

          {/* Catch all - redirect to vendor landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
