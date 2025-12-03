import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Building2,
  MapPin,
  Mail,
  Phone,
  Shield,
  Users,
  FileText,
  KeyRound,
  Globe,
  CreditCard,
  LayoutDashboard,
  Settings,
  X,
  XCircle,
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Eye,
  Package,
  Trash2
} from 'lucide-react';
import AdminService from '../../services/AdminService';
import toast from 'react-hot-toast';
import AccountActionModal from '../../components/admin/AccountActionModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const FILE_BASE = API_BASE.replace(/\/api\/v1$/i, '');

const buildFileUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${FILE_BASE}${url.startsWith('/') ? url : `/${url}`}`;
};

const InfoRow = ({ label, value, icon: Icon, children }) => (
  <div className="flex items-start gap-3">
    {Icon && <Icon className="h-4 w-4 text-gray-400 mt-1" />}
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <div className="text-gray-100 text-sm mt-0.5">{children || value || 'N/A'}</div>
    </div>
  </div>
);

const SectionCard = ({ title, children }) => (
  <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-lg">
    <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-widest">{title}</h3>
    {children}
  </section>
);

const NAV_LINKS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'approvals', label: 'Account Approvals', icon: Shield, active: true },
  { key: 'services', label: 'Services', icon: Building2 },
  { key: 'reports', label: 'Reports', icon: MapPin },
  { key: 'settings', label: 'Settings', icon: Settings }
];

const AdminAccountDetails = () => {
  const { serviceType, accountId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionModal, setActionModal] = useState({
    open: false,
    type: 'approve',
    loading: false
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const result = await AdminService.getAccountDetails(serviceType, accountId);
      setDetails(result.data || null);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [serviceType, accountId]);

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    const adminUser = localStorage.getItem('admin_user');
    if (!adminToken || !adminUser) {
      navigate('/admin/login', { replace: true });
    }

    const handleResize = () => {
      const mobileView = window.innerWidth < 1024;
      setIsMobile(mobileView);
      setSidebarOpen(!mobileView);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login', { replace: true });
  };

  const openActionModal = (type) => {
    setActionModal({
      open: true,
      type,
      loading: false
    });
  };

  const closeActionModal = () => {
    setActionModal({
      open: false,
      type: 'approve',
      loading: false
    });
  };

  const handleActionSubmit = async (payload) => {
    if (!details) return;
    try {
      setActionModal((prev) => ({ ...prev, loading: true }));
      if (actionModal.type === 'approve') {
        await AdminService.approveAccount('tours', details.submission.id, payload.approvalNote);
        toast.success('Account approved successfully!');
      } else {
        await AdminService.rejectAccount('tours', details.submission.id, payload.rejectionReason, payload.followUpAction);
        toast.success('Account rejected successfully!');
      }
      closeActionModal();
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message);
      setActionModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteAccount = async () => {
    if (!details) return;
    
    const businessName = details.business?.name || 'this vendor';
    
    const confirmed = window.confirm(
      `⚠️ WARNING: This action cannot be undone!\n\n` +
      `Are you sure you want to permanently delete ${businessName}?\n\n` +
      `This will delete:\n` +
      `• The vendor account\n` +
      `• All business data\n` +
      `• All associated records\n` +
      `• All uploaded files\n\n` +
      `Type the business name to confirm deletion.`
    );

    if (!confirmed) return;

    // Additional confirmation with business name
    const typedName = window.prompt(
      `To confirm deletion, please type the business name:\n"${businessName}"`
    );

    if (!typedName || typedName.trim().toLowerCase() !== businessName.trim().toLowerCase()) {
      toast.error('Business name does not match. Deletion cancelled.');
      return;
    }

    try {
      setLoading(true);
      await AdminService.deleteAccount(serviceType, accountId);
      toast.success('Account and all associated data deleted successfully');
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      toast.error(`Error deleting account: ${err.message}`);
      setLoading(false);
    }
  };

  const documentLinks = useMemo(() => {
    if (!details?.documents) return { identity: null, business: null };
    return {
      identity: details.documents.identity
        ? { ...details.documents.identity, url: buildFileUrl(details.documents.identity.url) }
        : null,
      business: details.documents.business
        ? { ...details.documents.business, url: buildFileUrl(details.documents.business.url) }
        : null
    };
  }, [details]);

  let content = null;

  if (loading) {
    content = (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto" />
          <p className="text-sm text-gray-400">Loading account details...</p>
        </div>
      </div>
    );
  } else if (error || !details) {
    content = (
      <div className="flex items-center justify-center py-20">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center space-y-4">
          <Shield className="h-10 w-10 text-red-400 mx-auto" />
          <p className="text-sm text-gray-400">
            {error || 'Unable to load account details for this submission.'}
          </p>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </button>
        </div>
      </div>
    );
  } else {
    const { submission, business, account, owner, progress } = details;
    const statusBadge =
      submission?.status === 'approved'
        ? 'bg-green-500/10 text-green-300 border border-green-500/30'
        : submission?.status === 'rejected'
        ? 'bg-red-500/10 text-red-300 border border-red-500/30'
        : 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/30';

    const tourTypes = business?.tourTypeNames?.length
      ? business.tourTypeNames.join(', ')
      : business?.tourTypeName;

    const passwordDisplay = account?.passwordPlaintext || account?.passwordHash || 'N/A';
    const passwordLabel = account?.passwordPlaintext ? 'Password' : 'Password (hashed)';

    content = (
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-800 text-sm text-gray-300 hover:bg-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div>
              <p className="text-xs uppercase text-gray-400 tracking-widest">Reviewing</p>
              <h1 className="text-2xl font-semibold text-white">{business?.name || 'Tour Business'}</h1>
              <div className="mt-2 flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge}`}>
                  {submission?.status?.replace('_', ' ').toUpperCase()}
                </span>
                {progress?.currentStep && (
                  <span className="text-xs text-gray-400">
                    Current Step:{' '}
                    <span className="text-gray-100 font-medium">{progress.currentStep}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {business?.id && (
              <button
                onClick={() => navigate(`/admin/packages?businessId=${business.id}`)}
                className="px-4 py-2 rounded-xl border border-blue-600/40 text-sm font-semibold text-blue-200 hover:bg-blue-600/10 flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                View Packages
              </button>
            )}
            {submission?.status === 'pending_review' && (
              <>
                <button
                  onClick={() => openActionModal('reject')}
                  className="px-4 py-2 rounded-xl border border-red-600/40 text-sm font-semibold text-red-200 hover:bg-red-600/10"
                >
                  Reject
                </button>
                <button
                  onClick={() => openActionModal('approve')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white"
                >
                  Approve
                </button>
              </>
            )}
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 rounded-xl border border-red-700/60 text-sm font-semibold text-red-400 hover:bg-red-700/20 flex items-center gap-2"
              title="Delete Account Permanently"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title="Business Overview">
            <div className="space-y-4">
              <InfoRow label="Business Name" value={business?.name} icon={Building2} />
              <InfoRow label="Service Type" value={business?.tourTypeName} icon={Shield} />
              <InfoRow label="All Tour Types" value={tourTypes || 'N/A'} icon={Globe} />
              <InfoRow label="Location" icon={MapPin}>
                <p>{business?.location || business?.locationData?.formatted_address || 'N/A'}</p>
                {business?.locationData?.lat && (
                  <p className="text-xs text-gray-500">
                    Lat: {business.locationData.lat} · Lng: {business.locationData.lng}
                  </p>
                )}
              </InfoRow>
              <InfoRow label="Business Phone" value={business?.phone} icon={Phone} />
              <InfoRow label="Currency" value={business?.currency} icon={CreditCard} />
            </div>
          </SectionCard>

          <SectionCard title="Submission Summary">
            <div className="space-y-4">
              <InfoRow
                label="Submitted On"
                value={submission?.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A'}
                icon={Clock}
              />
              <InfoRow label="Submission Notes" value={submission?.notes || 'No notes provided'} icon={FileText} />
              {submission?.rejectionReason && (
                <InfoRow
                  label="Previous Rejection Reason"
                  value={submission.rejectionReason}
                  icon={XCircle}
                />
              )}
            </div>
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title="Account Information">
            <div className="space-y-4">
              <InfoRow label="Account Name" value={account?.name} icon={Users} />
              <InfoRow label="Account Email" value={account?.email} icon={Mail} />
              <InfoRow label="Account Phone" value={account?.phone} icon={Phone} />
              <InfoRow label={passwordLabel} icon={KeyRound}>
                <code className="text-xs text-gray-300 break-all bg-gray-900/70 px-2 py-1 rounded-lg border border-gray-800 inline-block">
                  {passwordDisplay}
                </code>
                {!account?.passwordPlaintext && (
                  <p className="text-xs text-gray-500 mt-1">Password stored securely as a hash.</p>
                )}
              </InfoRow>
            </div>
          </SectionCard>

          <SectionCard title="Business Owner">
            <div className="space-y-4">
              <InfoRow
                label="Owner Name"
                value={
                  owner?.firstName || owner?.lastName
                    ? `${owner?.firstName || ''} ${owner?.lastName || ''}`.trim()
                    : 'N/A'
                }
                icon={Users}
              />
              <InfoRow label="Owner Email" value={owner?.email || account?.email} icon={Mail} />
              <InfoRow label="Country of Residence" value={owner?.countryOfResidence} icon={Globe} />
            </div>
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title="Identity Document">
            {documentLinks.identity ? (
              <div className="space-y-4">
                <InfoRow label="Issuing Country" value={documentLinks.identity.country} />
                <InfoRow label="File Name" value={documentLinks.identity.fileName} />
                <button
                  onClick={() => window.open(documentLinks.identity.url, '_blank', 'noopener')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-sm text-gray-100 hover:bg-gray-700"
                >
                  <Eye className="h-4 w-4" />
                  View Identity Document
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No identity document uploaded.</p>
            )}
          </SectionCard>

          <SectionCard title="Business Certificate">
            {documentLinks.business ? (
              <div className="space-y-4">
                <InfoRow label="Legal Name" value={documentLinks.business.legalName} />
                <InfoRow label="File Name" value={documentLinks.business.fileName} />
                <button
                  onClick={() => window.open(documentLinks.business.url, '_blank', 'noopener')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-sm text-gray-100 hover:bg-gray-700"
                >
                  <Eye className="h-4 w-4" />
                  View Business Document
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No business certificate uploaded.</p>
            )}
          </SectionCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-950 text-gray-100">
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">Travooz</p>
              <h1 className="text-lg font-semibold text-white">Admin Console</h1>
            </div>
          </div>
          {isMobile && (
            <button
              className="p-2 rounded-md hover:bg-gray-800"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {NAV_LINKS.map(({ key, label, icon: Icon, active }) => (
            <button
              key={key}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-indigo-600/20 text-indigo-300' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </nav>
        {isMobile && (
          <div className="px-6 py-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-700 rounded-md text-sm font-semibold bg-gray-800 text-gray-100 hover:bg-gray-700"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </aside>

      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-30" onClick={() => setSidebarOpen(false)}></div>
      )}

      <div className="flex-1 flex flex-col min-h-screen bg-gray-950 h-screen overflow-y-auto">
        <header className="bg-gray-900 border-b border-gray-800">
          <div className="px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-md hover:bg-gray-800 text-gray-300"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">Overview</p>
                <h2 className="text-xl font-semibold text-white">Account Detail</h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Quick search..."
                  className="bg-transparent text-sm focus:outline-none text-gray-100"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="relative p-2 rounded-full border border-gray-700 text-gray-300 hover:text-white">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="flex items-center gap-2 border border-gray-700 rounded-full px-3 py-1.5">
                <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-semibold">
                  AD
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-white">Admin User</p>
                  <p className="text-xs text-gray-400">Super Admin</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
              <button
                onClick={handleLogout}
                className="hidden md:inline-flex items-center gap-2 px-3 py-2 border border-gray-700 rounded-md text-sm font-semibold bg-gray-800 text-gray-100 hover:bg-gray-700"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6">{content}</main>
      </div>

      <AccountActionModal
        open={actionModal.open}
        type={actionModal.type}
        account={{
          business_name: details?.business?.name,
          service_type: 'tours'
        }}
        loading={actionModal.loading}
        onClose={closeActionModal}
        onConfirm={handleActionSubmit}
      />
    </div>
  );
};

export default AdminAccountDetails;

