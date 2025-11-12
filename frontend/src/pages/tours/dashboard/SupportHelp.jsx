import React, { useState } from 'react';
import { HelpCircle, MessageSquare, FileText, Send, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const SupportHelp = () => {
  const [activeTab, setActiveTab] = useState('help'); // 'help', 'contact', 'tickets'
  const [searchTerm, setSearchTerm] = useState('');
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    message: ''
  });

  const helpArticles = [
    {
      id: 1,
      title: 'How to create a tour package',
      category: 'Getting Started',
      content: 'Learn how to create and publish your first tour package...'
    },
    {
      id: 2,
      title: 'Managing bookings',
      category: 'Bookings',
      content: 'How to view, confirm, and manage customer bookings...'
    },
    {
      id: 3,
      title: 'Setting up pricing',
      category: 'Pricing',
      content: 'Configure pricing rules and special offers...'
    },
    {
      id: 4,
      title: 'Payment and payouts',
      category: 'Payments',
      content: 'Understanding payment processing and payout schedules...'
    }
  ];

  const filteredArticles = helpArticles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // TODO: Implement ticket submission
    toast.success('Support ticket submitted successfully');
    setTicketForm({
      subject: '',
      category: '',
      message: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support & Help</h1>
        <p className="text-sm text-gray-600 mt-1">Access help articles, contact support, or submit a ticket</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('help')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'help'
                ? 'border-[#3CAF54] text-[#3CAF54]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Help Articles</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contact'
                ? 'border-[#3CAF54] text-[#3CAF54]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Contact Support</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tickets'
                ? 'border-[#3CAF54] text-[#3CAF54]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <span>My Tickets</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Help Articles Tab */}
      {activeTab === 'help' && (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-medium text-[#3CAF54] bg-green-50 px-2 py-1 rounded">
                    {article.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{article.content}</p>
                <button className="text-sm text-[#3CAF54] hover:text-[#2d8f42] font-medium">
                  Read more →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Support Tab */}
      {activeTab === 'contact' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Support</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Email:</strong> support@travooz.com
              </p>
              <p className="text-sm text-blue-800 mt-2">
                <strong>Phone:</strong> +250 788 123 456
              </p>
              <p className="text-sm text-blue-800 mt-2">
                <strong>Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM (EAT)
              </p>
            </div>
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                  placeholder="What can we help you with?"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                >
                  <option value="">Select a category</option>
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing Question</option>
                  <option value="feature">Feature Request</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                  placeholder="Describe your issue or question..."
                  required
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-[#3CAF54] text-white rounded-lg hover:bg-[#2d8f42] transition-colors"
              >
                <Send className="h-5 w-5" />
                <span>Submit Ticket</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* My Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Support Tickets</h2>
          <div className="text-center py-12 text-gray-500">
            <HelpCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p>No support tickets yet</p>
            <p className="text-sm mt-2">Submit a ticket from the Contact Support tab</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportHelp;

