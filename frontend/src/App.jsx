import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Vendor Landing
import VendorLanding from './pages/vendor/VendorLanding';

// Auth Pages
import ServiceSelection from './pages/auth/ServiceSelection';

// Restaurant Pages
import ListYourRestaurant from './pages/restaurant/ListYourRestaurant';
import ListYourRestaurantStep2 from './pages/restaurant/ListYourRestaurantStep2';
import ListYourRestaurantStep3 from './pages/restaurant/ListYourRestaurantStep3';
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
import MyProperty from './pages/stays/MyProperty';
import RoomAvailability from './pages/stays/RoomAvailability';
import StaysBookings from './pages/stays/Bookings';
import StaysFinance from './pages/stays/Finance';

// Restaurant Dashboard Pages
import RestaurantDashboard from './pages/restaurant/Dashboard';
import Restaurants from './pages/restaurant/Restaurants';
import RestaurantOrders from './pages/restaurant/Orders';
import RestaurantMenuItems from './pages/restaurant/MenuItems';
import RestaurantDashboardLayout from './components/restaurant/RestaurantDashboardLayout';

// Tour Package Setup Pages
import ListYourTour from './pages/tours/ListYourTour';
import ListYourTourStep2 from './pages/tours/ListYourTourStep2';
import ListYourTourStep3 from './pages/tours/ListYourTourStep3';
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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        
        <Routes>
          {/* Vendor Landing Page */}
          <Route path="/" element={<VendorLanding />} />
          <Route path="/vendor" element={<VendorLanding />} />

          {/* Auth Pages */}
          <Route path="/auth/service-selection" element={<ServiceSelection />} />

          {/* Restaurant Listing Flow */}
          <Route path="/restaurant/list-your-restaurant" element={<ListYourRestaurant />} />
          <Route path="/restaurant/list-your-restaurant/step-2" element={<ListYourRestaurantStep2 />} />
          <Route path="/restaurant/list-your-restaurant/step-3" element={<ListYourRestaurantStep3 />} />
          
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

          {/* Stays Listing Flow */}
          <Route path="/stays/list-your-property" element={<ListYourProperty />} />
          <Route path="/stays/list-your-property/step-2" element={<ListYourPropertyStep2 />} />
          <Route path="/stays/list-your-property/step-3" element={<ListYourPropertyStep3 />} />
          <Route path="/stays/list-your-property/verify-email" element={<EmailVerification />} />
          
          {/* Stays Login */}
          <Route path="/stays/login" element={<StaysLogin />} />
          
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
          
          {/* Stays Dashboard */}
          <Route path="/stays/dashboard" element={<StaysDashboard />} />
          <Route path="/stays/dashboard/my-property" element={<MyProperty />} />
          <Route path="/stays/dashboard/bookings" element={<StaysBookings />} />
          <Route path="/stays/dashboard/room-availability" element={<RoomAvailability />} />
          <Route path="/stays/dashboard/finance" element={<StaysFinance />} />

          {/* Restaurant Dashboard - Nested Routes with Layout */}
          <Route path="/restaurant" element={<RestaurantDashboardLayout />}>
            <Route index element={<Navigate to="/restaurant/dashboard" replace />} />
            <Route path="dashboard" element={<RestaurantDashboard />} />
            <Route path="restaurants" element={<Restaurants />} />
            <Route path="orders" element={<RestaurantOrders />} />
            <Route path="menu-items" element={<RestaurantMenuItems />} />
          </Route>

          {/* Tour Package Listing Flow */}
          <Route path="/tours/list-your-tour" element={<ListYourTour />} />
          <Route path="/tours/list-your-tour/step-2" element={<ListYourTourStep2 />} />
          <Route path="/tours/list-your-tour/step-3" element={<ListYourTourStep3 />} />

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
          <Route path="/admin/tour-approvals" element={<TourApprovals />} />
          <Route path="/admin/tour-approvals/:id" element={<TourApprovals />} />

          {/* Catch all - redirect to vendor landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
