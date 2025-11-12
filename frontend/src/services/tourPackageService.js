import apiClient from './apiClient';

/**
 * Save tour package (create or update)
 */
export const saveTourPackage = async (packageData, packageId = null) => {
  try {
    const url = packageId 
      ? `/tours/packages/${packageId}`
      : '/tours/packages';
    
    const method = packageId ? 'put' : 'post';
    
    const response = await apiClient[method](url, packageData);
    return response.data;
  } catch (error) {
    console.error('Error saving tour package:', error);
    throw error;
  }
};

/**
 * Get tour package by ID
 */
export const getTourPackage = async (packageId) => {
  try {
    const response = await apiClient.get(`/tours/packages/${packageId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting tour package:', error);
    throw error;
  }
};

/**
 * Get all packages for a business
 */
export const getTourPackagesByBusiness = async (businessId) => {
  try {
    const response = await apiClient.get(`/tours/packages/business/${businessId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting tour packages:', error);
    throw error;
  }
};

/**
 * Delete tour package
 */
export const deleteTourPackage = async (packageId) => {
  try {
    const response = await apiClient.delete(`/tours/packages/${packageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting tour package:', error);
    throw error;
  }
};

/**
 * Transform API response to form data format
 */
export const transformApiDataToFormData = (apiData) => {
  if (!apiData) return null;

  return {
    // Step 1
    name: apiData.name || '',
    category: apiData.category || '',
    shortDescription: apiData.short_description || '',
    fullDescription: apiData.full_description || '',
    highlights: apiData.highlights || ['', '', ''],
    locations: apiData.locations || [],
    tags: apiData.tags || [],
    
    // Step 2
    whatsIncluded: apiData.whats_included || '',
    whatsNotIncluded: apiData.whats_not_included || '',
    guideType: apiData.guide_type || '',
    guideLanguage: apiData.guide_language || '',
    foodIncluded: apiData.food_included || false,
    meals: apiData.meals || [],
    drinksIncluded: apiData.drinks_included || false,
    showDietaryRestrictions: apiData.show_dietary_restrictions || false,
    dietaryRestrictions: apiData.dietaryRestrictions || [],
    transportationUsed: apiData.transportation_used || false,
    transportationTypes: apiData.transportationTypes || [],
    travelToDifferentCity: apiData.travel_to_different_city || false,
    
    // Step 3
    notSuitableFor: apiData.notSuitableFor || [],
    notAllowed: apiData.notAllowed || [],
    petPolicy: apiData.pet_policy || false,
    petPolicyDetails: apiData.pet_policy_details || '',
    mandatoryItems: apiData.mandatoryItems || [],
    knowBeforeYouGo: apiData.know_before_you_go || '',
    emergencyCountryCode: apiData.emergency_country_code || '+250',
    emergencyPhone: apiData.emergency_phone || '',
    voucherInformation: apiData.voucher_information || '',
    
    // Step 4
    photos: apiData.photos || [],
    
    // Step 5
    optionReferenceCode: apiData.option_reference_code || '',
    maxGroupSize: apiData.max_group_size || '',
    languages: apiData.languages || [],
    guideMaterials: apiData.guide_materials || false,
    guideMaterialsTypes: apiData.guideMaterials?.map(m => m.type) || [],
    guideMaterialsLanguages: apiData.guideMaterials?.map(m => m.language) || [],
    isPrivateActivity: apiData.is_private_activity || false,
    skipTheLine: apiData.skip_the_line || false,
    skipTheLineType: apiData.skip_the_line_type || '',
    wheelchairAccessible: apiData.wheelchair_accessible || false,
    durationType: apiData.duration_type || '',
    durationValue: apiData.duration_value || '',
    customerArrivalType: apiData.customer_arrival_type || '',
    pickupType: apiData.pickup_type || '',
    pickupTiming: apiData.pickup_timing || '',
    pickupConfirmation: apiData.pickup_confirmation || '',
    pickupTime: apiData.pickup_time || '',
    pickupDescription: apiData.pickup_description || '',
    dropOffType: apiData.drop_off_type || '',
    pickupTransportation: apiData.pickup_transportation || '',
    availabilityType: apiData.availability_type || '',
    pricingType: apiData.pricing_type || '',
    pricingCategory: apiData.schedules?.[0]?.pricingCategories?.[0]?.category_type || apiData.schedules?.[0]?.pricingCategories?.[0]?.type || 'same-price',
    schedules: apiData.schedules || [],
    scheduleName: apiData.schedules?.[0]?.schedule_name || '',
    scheduleStartDate: apiData.schedules?.[0]?.start_date || '',
    scheduleHasEndDate: apiData.schedules?.[0]?.has_end_date || false,
    scheduleEndDate: apiData.schedules?.[0]?.end_date || '',
    weeklySchedule: apiData.schedules?.[0]?.weeklySchedule || {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    },
    scheduleExceptions: apiData.schedules?.[0]?.exceptions || [],
    // Capacity data
    minParticipants: apiData.schedules?.[0]?.capacity?.min_participants?.toString() || '',
    maxParticipants: apiData.schedules?.[0]?.capacity?.max_participants?.toString() || '',
    exceptionsShareCapacity: apiData.schedules?.[0]?.capacity?.exceptions_share_capacity !== undefined 
      ? apiData.schedules?.[0]?.capacity?.exceptions_share_capacity 
      : true,
    // Pricing Tiers
    pricingTiers: apiData.schedules?.[0]?.pricingTiers || apiData.schedules?.[0]?.pricing_tiers || []
  };
};

/**
 * Tour Package Setup Service
 * Handles all tour setup flow operations
 */
export const tourPackageSetupService = {
  /**
   * Get submission status for a tour business
   */
  async getSubmissionStatus(tourBusinessId) {
    try {
      const response = await apiClient.get(`/tours/setup/submission-status?tourBusinessId=${tourBusinessId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting submission status:', error);
      throw error;
    }
  },

  /**
   * Submit tour business for verification
   */
  async submitForVerification(tourBusinessId) {
    try {
      const response = await apiClient.post('/tours/setup/submit', { tourBusinessId });
      return response.data;
    } catch (error) {
      console.error('Error submitting for verification:', error);
      throw error;
    }
  },

  /**
   * Create tour listing
   */
  async createTourListing(data) {
    try {
      const response = await apiClient.post('/tours/businesses', data);
      return response.data;
    } catch (error) {
      console.error('Error creating tour listing:', error);
      throw error;
    }
  },

  /**
   * Save business details
   */
  async saveBusinessDetails(data) {
    try {
      const response = await apiClient.put(`/tours/businesses/${data.tourBusinessId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error saving business details:', error);
      throw error;
    }
  },

  /**
   * Save business owner info
   */
  async saveBusinessOwnerInfo(data) {
    try {
      const response = await apiClient.post('/tours/setup/business-owner-info', data);
      return response.data;
    } catch (error) {
      console.error('Error saving business owner info:', error);
      throw error;
    }
  },

  /**
   * Save identity proof
   */
  async saveIdentityProof(data) {
    try {
      const formData = new FormData();
      if (data.idCardPhoto) {
        formData.append('idCardPhoto', data.idCardPhoto);
      }
      if (data.userId) {
        formData.append('userId', data.userId);
      }
      if (data.tourBusinessId) {
        formData.append('tourBusinessId', data.tourBusinessId);
      }
      // Backend expects 'idCountry' (not 'countryOfResidence' or 'idRegistrationCountry')
      if (data.idCountry) {
        formData.append('idCountry', data.idCountry);
      }

      const response = await apiClient.post('/tours/setup/identity-proof', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error saving identity proof:', error);
      throw error;
    }
  },

  /**
   * Save business proof
   */
  async saveBusinessProof(data) {
    try {
      const formData = new FormData();
      if (data.professionalCertificate) {
        formData.append('professionalCertificate', data.professionalCertificate);
      }
      formData.append('userId', data.userId);
      formData.append('tourBusinessId', data.tourBusinessId);
      if (data.businessLegalName) formData.append('businessLegalName', data.businessLegalName);

      const response = await apiClient.post('/tours/setup/business-proof', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error saving business proof:', error);
      throw error;
    }
  },

  /**
   * Send email verification code
   */
  async sendEmailVerificationCode(userId, email, userName) {
    try {
      const response = await apiClient.post('/tours/email-verification/send', {
        userId,
        email,
        userName
      });
      return response.data;
    } catch (error) {
      console.error('Error sending email verification code:', error);
      throw error;
    }
  },

  /**
   * Verify email code
   */
  async verifyEmailCode(userId, email, verificationCode, tourBusinessId) {
    try {
      const response = await apiClient.post('/tours/email-verification/verify', {
        userId,
        email,
        code: verificationCode, // Backend expects 'code' not 'verificationCode'
        tourBusinessId
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying email code:', error);
      throw error;
    }
  },

  /**
   * Submit agreement
   */
  async submitAgreement(data) {
    try {
      const response = await apiClient.post('/tours/setup/progress', {
        tourBusinessId: data.tourBusinessId,
        userId: data.userId,
        stepNumber: data.stepNumber || 7, // Agreement step
        isComplete: true
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting agreement:', error);
      throw error;
    }
  },

  /**
   * Save tax payment
   */
  async saveTaxPayment(data) {
    try {
      // This might need to be implemented based on your tax payment endpoint
      const response = await apiClient.post('/tours/setup/progress', {
        tourBusinessId: data.tourBusinessId,
        userId: data.userId,
        stepNumber: data.stepNumber || 6, // Tax payment step
        isComplete: true
      });
      return response.data;
    } catch (error) {
      console.error('Error saving tax payment:', error);
      throw error;
    }
  },

  /**
   * Create tour package (legacy method for setup flow)
   */
  async createTourPackage(tourData) {
    try {
      const response = await apiClient.post('/tours/packages', tourData);
      return response.data;
    } catch (error) {
      console.error('Error creating tour package:', error);
      throw error;
    }
  }
};
