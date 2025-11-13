import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, CheckCircle, ArrowRight } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import carRentalSetupService from '../../services/carRentalSetupService';

export default function SetupComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const carRentalBusinessId = location.state?.carRentalBusinessId || localStorage.getItem('car_rental_business_id');
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/car-rental/list-your-car-rental', { replace: true });
      return;
    }

    const fetchStatus = async () => {
      if (!carRentalBusinessId) {
        setSubmissionStatus('in_progress');
        setIsChecking(false);
        return;
      }

      try {
        const response = await carRentalSetupService.getSubmissionStatus(carRentalBusinessId);
        const data = response?.data || response || {};
        setSubmissionStatus(data.status || 'pending_review');
      } catch (error) {
        console.error('Error fetching submission status:', error);
        setSubmissionStatus('pending_review');
      } finally {
        setIsChecking(false);
      }
    };

    fetchStatus();
  }, [navigate, carRentalBusinessId]);

  const handleGoToDashboard = async () => {
    if (!carRentalBusinessId) {
      navigate('/car-rental/list-your-car-rental');
      return;
    }

    try {
      const response = await carRentalSetupService.getSubmissionStatus(carRentalBusinessId);
      const data = response?.data || response || {};
      const status = data.status || 'pending_review';
      setSubmissionStatus(status);
      
      if (status === 'approved') {
        navigate('/car-rental/dashboard');
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  if (isChecking || submissionStatus === null) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
        <StaysNavbar />
        <div className="flex-1 w-full py-8 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3CAF54] mx-auto mb-4"></div>
            <p className="text-gray-600">Checking status...</p>
          </div>
        </div>
        <StaysFooter />
      </div>
    );
  }

  if (submissionStatus === 'approved') {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
        <StaysNavbar />
        <div className="flex-1 w-full py-8 px-4 flex items-center justify-center">
          <div className="max-w-2xl w-full mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-12 border text-center" style={{ borderColor: '#dcfce7' }}>
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
                  <CheckCircle className="h-16 w-16" style={{ color: '#3CAF54' }} />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Verification Complete!
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Congratulations! Your account has been verified and approved.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <p className="text-sm text-green-800 mb-2">
                  <strong>You're all set!</strong>
                </p>
                <p className="text-sm text-green-700">
                  You can now start creating and managing your car rentals on the platform.
                </p>
              </div>

              <button
                onClick={() => navigate('/car-rental/dashboard')}
                className="w-full text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#3CAF54' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <StaysFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      <div className="flex-1 w-full py-8 px-4 flex items-center justify-center">
        <div className="max-w-2xl w-full mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-12 border text-center" style={{ borderColor: '#dcfce7' }}>
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fef3c7' }}>
                <Clock className="h-16 w-16" style={{ color: '#f59e0b' }} />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Please Wait While We Verify You
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Your registration has been submitted successfully. Our team is now reviewing your information and verifying your documents.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <p className="text-sm text-blue-800 mb-2">
                <strong>What happens next?</strong>
              </p>
              <p className="text-sm text-blue-700 mb-3">
                Once you are verified, we will notify you to start creating your car rentals.
              </p>
              <p className="text-sm text-blue-700">
                This typically takes 1-3 business days. You will receive an email notification once your account is approved.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <p className="text-sm text-yellow-800">
                <strong>⏳ Review Process:</strong> Our team is carefully reviewing your business information, identity documents, and professional certificates to ensure everything is valid and legally accepted.
              </p>
            </div>

            <button
              onClick={handleGoToDashboard}
              className="w-full text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
              style={{ backgroundColor: '#3CAF54' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
            >
              <span>Check Status</span>
              <ArrowRight className="h-5 w-5" />
            </button>

            <p className="text-sm text-gray-500 mt-6">
              You can log in to your dashboard to check your verification status. Once approved, you'll be able to create car rentals.
            </p>
          </div>
        </div>
      </div>
      <StaysFooter />
    </div>
  );
}















