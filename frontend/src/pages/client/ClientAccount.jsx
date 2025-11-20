import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, LogOut, Mail, Phone, User, Calendar, Shield, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import clientAuthService from '../../services/clientAuthService';

const formatDateTime = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export default function ClientAccount() {
  const navigate = useNavigate();
  const [client, setClient] = useState(clientAuthService.getStoredClient());
  const [isLoading, setIsLoading] = useState(!client);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('client_token');
    if (!token) {
      navigate('/client/login', { replace: true });
      return;
    }

    if (!client) {
      loadProfile();
    } else {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const profile = await clientAuthService.getProfile();
      setClient(profile);
    } catch (error) {
      console.error('Failed to load client profile:', error);
      setFetchError(error.response?.data?.message || 'Unable to load your profile.');
      toast.error('Please sign in again');
      clientAuthService.logout();
      navigate('/client/login', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clientAuthService.logout();
    toast.success('You have been signed out');
    navigate('/client/login', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading your account...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
        <p className="text-lg font-semibold text-gray-900 mb-2">We couldn&apos;t load your profile</p>
        <p className="text-gray-600 mb-4">{fetchError}</p>
        <button
          onClick={loadProfile}
          className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-emerald-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="bg-white shadow-sm rounded-2xl p-6 border border-emerald-100 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-600 tracking-wide uppercase">Client Portal</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">
              Hi {client?.firstName} {client?.lastName}
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your bookings, upcoming dining experiences, and saved cars from one secure place.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white font-semibold px-5 py-3 rounded-xl hover:bg-black transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              Personal details
            </h2>
            <dl className="space-y-3 text-gray-700">
              <div className="flex justify-between">
                <dt className="text-gray-500">Full name</dt>
                <dd className="font-medium">{client?.firstName} {client?.lastName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Email</dt>
                <dd className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {client?.email}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Phone</dt>
                <dd className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {client?.phoneCountryCode && client?.phoneNumber
                    ? `${client.phoneCountryCode} ${client.phoneNumber}`
                    : 'Add a phone number'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              Account security
            </h2>
            <dl className="space-y-3 text-gray-700">
              <div className="flex justify-between">
                <dt className="text-gray-500">Account status</dt>
                <dd>
                  <span className="inline-flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-sm font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {client?.status === 'active' ? 'Active' : client?.status}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Email verified</dt>
                <dd className="font-medium">
                  {client?.emailVerified ? 'Yes' : 'Pending'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Last login</dt>
                <dd className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {formatDateTime(client?.lastLogin)}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Ready to book your next experience?</h2>
              <p className="text-gray-600">
                Browse restaurants, car rentals, and homestays from the client site using your new account.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-emerald-700"
              >
                Explore vendors
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/restaurant/1/order"
                className="inline-flex items-center gap-2 border border-gray-200 px-5 py-3 rounded-xl font-semibold text-gray-700 hover:border-gray-300"
              >
                Try ordering
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Tip: replace the restaurant ID in the URL with any public restaurant to start an order.
          </p>
        </section>
      </div>
    </div>
  );
}

