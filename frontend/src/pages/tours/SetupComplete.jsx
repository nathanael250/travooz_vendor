import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, CheckCircle, ArrowRight } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { tourPackageSetupService } from '../../services/tourPackageService';

export default function SetupComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const tourBusinessId = location.state?.tourBusinessId || localStorage.getItem('tour_business_id');
  const [submissionStatus, setSubmissionStatus] = useState(null); // Start with null to prevent flash
  const [isChecking, setIsChecking] = useState(true); // Loading state

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/tours/list-your-tour', { replace: true });
      return;
    }

    // Check submission status
    const checkStatus = async () => {
      setIsChecking(true);
      try {
        if (tourBusinessId) {
          console.log('🔍 Checking status for tourBusinessId:', tourBusinessId);
          const result = await tourPackageSetupService.getSubmissionStatus(tourBusinessId);
          console.log('📊 SetupComplete - Raw API response:', JSON.stringify(result, null, 2));
          
          // Extract status from different possible response structures
          let status = null;
          
          // Check if this is a "no submission found" response first
          const apiMessage = result?.message || result?.data?.message || '';
          const dataStatus = result?.data?.status;
          
          // If API explicitly says "No submission found" or status is explicitly null in data
          if (apiMessage.includes('No submission found') || 
              apiMessage.includes('No submission') ||
              (dataStatus === null && apiMessage)) {
            console.log('🗑️ Database appears to be cleared. No submission found. Redirecting to start fresh...');
            
            // Clear localStorage to start fresh
            localStorage.removeItem('tour_business_id');
            localStorage.removeItem('tour_submission_status');
            
            // Redirect immediately - don't render anything
            navigate('/tours/list-your-tour', { replace: true });
            return;
          }
          
          // Try multiple ways to extract status
          if (result?.status) {
            status = result.status;
          } else if (result?.data?.status) {
            status = result.data.status;
          } else if (result?.data?.data?.status) {
            status = result.data.data.status;
          } else if (typeof result === 'string') {
            status = result;
          }
          
          // Handle null status (no submission found - database was cleared or no submission exists)
          if (status === null || status === undefined) {
            console.log('⚠️ No submission data found. Redirecting to start fresh...');
            localStorage.removeItem('tour_business_id');
            localStorage.removeItem('tour_submission_status');
            navigate('/tours/list-your-tour', { replace: true });
            return;
          }
          
          console.log('📊 SetupComplete - Extracted status:', status);
          
          // Update status and stop loading
          setSubmissionStatus(status);
          setIsChecking(false);
          
          // Store status in localStorage for quick access
          localStorage.setItem('tour_submission_status', status);
          
          // If approved, automatically redirect to dashboard immediately
          if (status === 'approved') {
            console.log('✅ User approved! Redirecting to dashboard immediately...');
            navigate('/tours/dashboard', { replace: true });
            return;
          }
        } else {
          console.warn('⚠️ No tourBusinessId found. Database may have been cleared.');
          
          // If no tourBusinessId and no data in database, redirect to start
          // Clear localStorage and redirect
          localStorage.removeItem('tour_business_id');
          localStorage.removeItem('tour_submission_status');
          
          console.log('🗑️ No tour business found. Redirecting to start fresh...');
          navigate('/tours/list-your-tour', { replace: true });
          return;
        }
      } catch (error) {
        console.error('❌ Error checking submission status:', error);
        console.error('❌ Error details:', error.response?.data || error.message);
        
        // If it's a 404 or "not found" error, database was likely cleared
        if (error.response?.status === 404 || 
            error.message?.includes('not found') || 
            error.message?.includes('No submission')) {
          console.log('🗑️ Submission not found (database may be cleared). Redirecting to start fresh...');
          localStorage.removeItem('tour_business_id');
          localStorage.removeItem('tour_submission_status');
          navigate('/tours/list-your-tour', { replace: true });
          return;
        }
        
        // For other errors, check localStorage as fallback
        const storedStatus = localStorage.getItem('tour_submission_status');
        if (storedStatus) {
          console.log('📦 Using stored status from localStorage after error:', storedStatus);
          setSubmissionStatus(storedStatus);
          setIsChecking(false);
          
          if (storedStatus === 'approved') {
            navigate('/tours/dashboard', { replace: true });
            return;
          }
        } else {
          // No stored status either, redirect to start
          console.log('⚠️ No stored status found. Redirecting to start fresh...');
          localStorage.removeItem('tour_business_id');
          navigate('/tours/list-your-tour', { replace: true });
          return;
        }
      } finally {
        setIsChecking(false);
      }
    };

    // Check immediately on mount
    checkStatus();
    
    // Set up periodic status checking (every 10 seconds) for pending users
    // This way if they're approved while on the page, it will update quickly
    // The checkStatus function will handle redirects if needed
    const intervalId = setInterval(() => {
      console.log('🔄 Periodic status check...');
      checkStatus();
    }, 10000); // Check every 10 seconds for faster updates

    return () => {
      clearInterval(intervalId);
    };
  }, [navigate, tourBusinessId]); // Removed submissionStatus from dependencies to prevent loops

  const handleGoToDashboard = async () => {
    // Always check status first when button is clicked
    try {
      if (tourBusinessId) {
        const result = await tourPackageSetupService.getSubmissionStatus(tourBusinessId);
        let status = result?.status || result?.data?.status || result?.data?.data?.status;
        
        if (status === 'approved') {
          navigate('/tours/dashboard');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking status on button click:', error);
    }
    
    // If still pending or error, reload to check again
    window.location.reload();
  };

  // Show loading state while checking
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

  // If approved, show success message and allow dashboard access
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
                  You can now start creating and managing your tour packages on the platform.
                </p>
              </div>

              <button
                onClick={handleGoToDashboard}
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

  // Pending review - show waiting message
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
                Once you are verified, we will notify you to start creating your products.
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
              You can log in to your dashboard to check your verification status. Once approved, you'll be able to create tour packages.
            </p>
          </div>
        </div>
      </div>
      <StaysFooter />
    </div>
  );
}

