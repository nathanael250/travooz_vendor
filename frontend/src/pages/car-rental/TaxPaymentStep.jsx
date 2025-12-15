import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, FileText, Upload, X, FileCheck } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import toast from 'react-hot-toast';
import carRentalSetupService from '../../services/carRentalSetupService';

export default function TaxPaymentStep() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const businessDetails = location.state?.businessDetails || {};
  const carRentalBusinessId = location.state?.carRentalBusinessId || localStorage.getItem('car_rental_business_id');
  const resolvedUserId = location.state?.userId || localStorage.getItem('car_rental_user_id');

  React.useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const [formData, setFormData] = useState({
    tin: '',
    legalBusinessName: '',
  });

  const [documents, setDocuments] = useState({
    professionalCertificate: null,
    ownerID: null,
    businessRegistration: null,
  });

  const [documentPreviews, setDocumentPreviews] = useState({
    professionalCertificate: null,
    ownerID: null,
    businessRegistration: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const convertFileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDocumentChange = (e, documentType) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF, JPG, or PNG file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setDocuments(prev => ({
      ...prev,
      [documentType]: file
    }));

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentPreviews(prev => ({
          ...prev,
          [documentType]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setDocumentPreviews(prev => ({
        ...prev,
        [documentType]: 'pdf'
      }));
    }
  };

  const removeDocument = (documentType) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: null
    }));
    setDocumentPreviews(prev => ({
      ...prev,
      [documentType]: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.tin.trim()) {
      newErrors.tin = 'Tax Identification Number is required';
    }
    if (!formData.legalBusinessName.trim()) {
      newErrors.legalBusinessName = 'Legal business name is required';
    }

    if (!documents.professionalCertificate) {
      newErrors.professionalCertificate = 'Professional certificate is required';
    }
    if (!documents.ownerID) {
      newErrors.ownerID = 'Owner ID is required';
    }
    if (!documents.businessRegistration) {
      newErrors.businessRegistration = 'Business registration certificate is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!carRentalBusinessId) {
      toast.error('Unable to locate your car rental registration. Please restart the onboarding flow.');
      return;
    }

    if (!resolvedUserId) {
      toast.error('Unable to determine the current user. Please sign in again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const documentsPayload = await Promise.all(
        Object.entries(documents)
          .filter(([, file]) => !!file)
          .map(async ([type, file]) => ({
            type,
            name: file.name,
            size: file.size,
            mimeType: file.type,
            base64: await convertFileToBase64(file)
          }))
      );

      await carRentalSetupService.saveTaxPayment({
        carRentalBusinessId: Number(carRentalBusinessId),
        userId: resolvedUserId,
        taxPayment: formData,
        documents: documentsPayload
      });
      
      toast.success('Tax & payment information saved successfully');
      
      navigate('/car-rental/setup/review', {
        state: {
          ...location.state,
          businessDetails,
          taxPayment: formData,
          carRentalBusinessId,
          userId: resolvedUserId
        }
      });
    } catch (error) {
      console.error('Error saving tax & payment information:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save tax & payment information. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/car-rental/setup/business-details', {
      state: {
        ...location.state,
        businessDetails
      }
    });
  };

  const renderDocumentUpload = (documentType, label, description) => {
    const hasDocument = documents[documentType];
    const preview = documentPreviews[documentType];

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} *
        </label>
        {!hasDocument ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleDocumentChange(e, documentType)}
              className="hidden"
              id={`${documentType}-input`}
            />
            <label
              htmlFor={`${documentType}-input`}
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-700 mb-1">Click to upload</span>
              <span className="text-xs text-gray-500">{description}</span>
              <span className="text-xs text-gray-400 mt-1">PDF, JPG, or PNG (Max 5MB)</span>
            </label>
          </div>
        ) : (
          <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {preview && preview !== 'pdf' ? (
                  <img src={preview} alt={label} className="h-16 w-16 object-cover rounded" />
                ) : (
                  <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{documents[documentType].name}</p>
                  <p className="text-xs text-gray-500">
                    {(documents[documentType].size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeDocument(documentType)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
        {errors[documentType] && (
          <p className="mt-1 text-sm text-red-600">{errors[documentType]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-3xl w-full mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  5
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  6
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  7
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  8
                </div>
              </div>
            </div>
            <p className="text-center text-sm font-medium" style={{ color: '#1f6f31' }}>Step 5 of 8: Tax & Payment Information</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-8 w-8" style={{ color: '#3CAF54' }} />
              <h1 className="text-3xl font-bold text-gray-900">
                Tax & Payment Information
              </h1>
            </div>
            
            <p className="text-gray-600 mb-8">
              Please provide legal and payment-related details to comply with regulations and receive payouts.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tax Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Tax Information</h3>
                
                <div>
                  <label htmlFor="tin" className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Identification Number (TIN) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="tin"
                      name="tin"
                      value={formData.tin}
                      onChange={handleChange}
                      placeholder="Enter your TIN"
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.tin ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                      }`}
                    />
                  </div>
                  {errors.tin && (
                    <p className="mt-1 text-sm text-red-600">{errors.tin}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="legalBusinessName" className="block text-sm font-medium text-gray-700 mb-2">
                    Legal Business Name (as per tax records) *
                  </label>
                  <input
                    type="text"
                    id="legalBusinessName"
                    name="legalBusinessName"
                    value={formData.legalBusinessName}
                    onChange={handleChange}
                    placeholder="Enter legal business name"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                      errors.legalBusinessName ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  />
                  {errors.legalBusinessName && (
                    <p className="mt-1 text-sm text-red-600">{errors.legalBusinessName}</p>
                  )}
                </div>
              </div>

              {/* Document Uploads */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <FileCheck className="h-5 w-5" style={{ color: '#3CAF54' }} />
                  <h3 className="text-lg font-semibold text-gray-900">Document Uploads for Verification</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Please upload these documents to confirm your business. This helps us verify your account before you can start listing car rentals.
                </p>

                {renderDocumentUpload(
                  'professionalCertificate',
                  'Professional Certificate / Car Rental License',
                  'Upload your professional certificate or car rental license'
                )}

                {renderDocumentUpload(
                  'ownerID',
                  'Business Owner ID',
                  'Upload passport, national ID, or driver\'s license'
                )}

                {renderDocumentUpload(
                  'businessRegistration',
                  'Business Registration Certificate',
                  'Upload your business registration certificate'
                )}
              </div>

              {/* Error Display */}
              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 px-6 py-3 border-2 rounded-lg font-semibold transition-colors text-gray-700 hover:bg-gray-50"
                  style={{ borderColor: '#d1d5db' }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back</span>
                  </div>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#3CAF54' }}
                  onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#2d8f42')}
                  onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#3CAF54')}
                >
                  {isSubmitting ? (
                    <>
                      <span>Saving...</span>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </>
                  ) : (
                    <>
                      <span>Next</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <StaysFooter />
    </div>
  );
}















