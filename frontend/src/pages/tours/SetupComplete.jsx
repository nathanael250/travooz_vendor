import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, CheckCircle, ArrowRight, LogOut, XCircle, AlertCircle } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { tourPackageSetupService } from '../../services/tourPackageService';

export default function SetupComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const tourBusinessId = location.state?.tourBusinessId || localStorage.getItem('tour_business_id');
  const [submissionStatus, setSubmissionStatus] = useState(null); // Start with null to prevent flash
  const [isChecking, setIsChecking] = useState(true); // Loading state
  const [rejectionDetails, setRejectionDetails] = useState(null); // Store rejection reason and step

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
          
          // Extract rejection details if rejected
          if (status === 'rejected') {
            const rejectionReason = result?.rejection_reason || result?.data?.rejection_reason;
            const currentStep = result?.current_step || result?.data?.current_step;
            const notes = result?.notes || result?.data?.notes;
            
            setRejectionDetails({
              reason: rejectionReason,
              step: currentStep,
              notes: notes
            });
          } else {
            setRejectionDetails(null);
          }
          
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('tour_business_id');
    localStorage.removeItem('tour_submission_status');
    navigate('/login', { replace: true });
  };

  const getStepRoute = (step) => {
    const stepRoutes = {
      2: '/tours/list-your-tour/step-2',
      3: '/tours/list-your-tour/step-3',
      4: '/tours/setup/prove-identity',
      5: '/tours/setup/prove-business',
      6: '/tours/setup/review'
    };
    return stepRoutes[step] || '/tours/list-your-tour';
  };

  const getStepName = (step) => {
    const stepNames = {
      2: 'Business Details',
      3: 'Account Information',
      4: 'Identity Verification',
      5: 'Business Documents',
      6: 'Final Review'
    };
    return stepNames[step] || `Step ${step}`;
  };

  const getRejectionReasonLabel = (reason) => {
    const reasonLabels = {
      'missing_documents': 'Missing or incomplete documents',
      'identity_mismatch': 'Identity information does not match',
      'business_info_mismatch': 'Business information mismatch',
      'illegible_documents': 'Documents are illegible',
      'fraud_suspected': 'Suspected fraudulent submission'
    };
    return reasonLabels[reason] || reason || 'Submission requires corrections';
  };

  const handleGoToStep = () => {
    if (rejectionDetails?.step) {
      const route = getStepRoute(rejectionDetails.step);
      navigate(route);
    } else {
      navigate('/tours/list-your-tour');
    }
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

  const isApproved = submissionStatus === 'approved';
  const isRejected = submissionStatus === 'rejected';

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      <div className="flex-1 w-full py-8 px-4 flex items-center justify-center">
        <div className="max-w-xl w-full mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border p-8 text-center space-y-6" style={{ borderColor: isRejected ? '#fee2e2' : '#dcfce7' }}>
            <div className="flex justify-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: isApproved ? '#dcfce7' : isRejected ? '#fee2e2' : '#fef3c7' }}
              >
                {isApproved ? (
                  <CheckCircle className="h-12 w-12" style={{ color: '#3CAF54' }} />
                ) : isRejected ? (
                  <XCircle className="h-12 w-12" style={{ color: '#ef4444' }} />
                ) : (
                  <Clock className="h-12 w-12" style={{ color: '#f59e0b' }} />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {isApproved ? 'You Are Verified!' : isRejected ? 'Submission Needs Corrections' : "We're Reviewing Your Details"}
            </h1>
              <p className="text-base text-gray-600">
                {isApproved
                  ? 'Your account is approved. Go ahead and start creating your tour packages.'
                  : isRejected
                  ? 'Our team reviewed your submission, but we need a few corrections before we can approve it.'
                  : 'Thanks for submitting your documents. Our team is verifying everything to keep the marketplace secure.'}
              </p>
            </div>

            {isRejected && rejectionDetails && (
              <div className="space-y-4 text-left">
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-900 mb-2">Issue Found:</p>
                      <p className="text-sm text-red-800 mb-3">
                        {getRejectionReasonLabel(rejectionDetails.reason)}
                      </p>
                      {rejectionDetails.notes && (
                        <p className="text-xs text-red-700 mt-2 italic">
                          Note: {rejectionDetails.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {rejectionDetails.step && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">Action Required:</span> Please return to <strong>{getStepName(rejectionDetails.step)}</strong> to fix the highlighted issues.
              </p>
            </div>
                )}
              </div>
            )}

            {!isApproved && !isRejected && (
              <div className="rounded-lg bg-green-50 text-green-800 text-sm p-4">
                We usually wrap up reviews within 1–3 business days. You'll receive an email as soon as we're done.
              </div>
            )}

            <div className="space-y-3">
              {isRejected && rejectionDetails?.step ? (
                <button
                  onClick={handleGoToStep}
                  className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  style={{ backgroundColor: '#3CAF54' }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#2d8f42')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = '#3CAF54')}
                >
                  <span>Go to {getStepName(rejectionDetails.step)}</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
            <button
              onClick={handleGoToDashboard}
                  className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              style={{ backgroundColor: '#3CAF54' }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#2d8f42')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = '#3CAF54')}
            >
                  <span>{isApproved ? 'Go to Dashboard' : 'Check Status'}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
              )}

              {!isApproved && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full border-2 border-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 hover:bg-gray-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Log Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <StaysFooter />
    </div>
  );
}

