import React, { useState } from 'react';
import { HelpCircle, Mail, MessageCircle, FileText, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const Support = () => {
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      // TODO: Implement API call to send support message
      toast.success('Support request sent successfully');
      setContactForm({ subject: '', message: '' });
    } catch (error) {
      console.error('Error sending support request:', error);
      toast.error('Failed to send support request');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support & Help</h1>
          <p className="text-gray-600 mt-1">Get help and contact support</p>
        </div>
      </div>

      {/* Help Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-6 w-6 text-[#3CAF54]" />
            <h3 className="font-semibold text-gray-900">Documentation</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Browse our comprehensive guides and tutorials</p>
          <button className="text-[#3CAF54] hover:text-[#2d8f3f] text-sm font-medium">
            View Docs →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="h-6 w-6 text-[#3CAF54]" />
            <h3 className="font-semibold text-gray-900">FAQ</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Find answers to frequently asked questions</p>
          <button className="text-[#3CAF54] hover:text-[#2d8f3f] text-sm font-medium">
            View FAQ →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="h-6 w-6 text-[#3CAF54]" />
            <h3 className="font-semibold text-gray-900">Contact Us</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Get in touch with our support team</p>
          <button className="text-[#3CAF54] hover:text-[#2d8f3f] text-sm font-medium">
            Contact →
          </button>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="h-6 w-6 text-[#3CAF54]" />
          <h2 className="text-lg font-semibold text-gray-900">Send Support Request</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
            <input
              type="text"
              required
              value={contactForm.subject}
              onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
              placeholder="What can we help you with?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
            <textarea
              rows="6"
              required
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
              placeholder="Describe your issue or question in detail..."
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 px-6 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#3CAF54' }}
            >
              <Send className="h-5 w-5" />
              {sending ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-900 mb-1">Getting Started Guide</h3>
            <p className="text-sm text-gray-600">Learn how to set up your car rental business</p>
          </a>
          <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-900 mb-1">Pricing Guide</h3>
            <p className="text-sm text-gray-600">Understand how to set competitive rates</p>
          </a>
          <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-900 mb-1">Booking Management</h3>
            <p className="text-sm text-gray-600">Tips for managing bookings effectively</p>
          </a>
          <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-900 mb-1">Troubleshooting</h3>
            <p className="text-sm text-gray-600">Common issues and solutions</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Support;

