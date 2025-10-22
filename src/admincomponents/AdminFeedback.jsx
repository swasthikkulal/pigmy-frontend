import React, { useState } from "react";
import {
  Search,
  Star,
  MessageSquare,
  User,
  Calendar,
  Filter,
} from "lucide-react";

const AdminFeedback = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const feedbackData = [
    {
      id: "1",
      customerName: "Alice Johnson",
      email: "alice@example.com",
      rating: 5,
      subject: "Excellent Service",
      message:
        "The pigmy collection service has been excellent. The collector is always on time and very professional.",
      category: "Service",
      status: "resolved",
      createdAt: "2024-01-15",
      response: "Thank you for your feedback! We appreciate your kind words.",
    },
    {
      id: "2",
      customerName: "Bob Smith",
      email: "bob@example.com",
      rating: 3,
      subject: "Mobile App Issues",
      message:
        "Having trouble with the mobile app when trying to check my balance. It crashes frequently.",
      category: "Technical",
      status: "in-progress",
      createdAt: "2024-01-14",
      response: "",
    },
    {
      id: "3",
      customerName: "Carol Davis",
      email: "carol@example.com",
      rating: 4,
      subject: "Collection Timing",
      message:
        "Would appreciate if collections could happen in the evening instead of morning.",
      category: "Suggestion",
      status: "new",
      createdAt: "2024-01-13",
      response: "",
    },
  ];

  const filteredFeedback = feedbackData.filter((feedback) => {
    const matchesSearch =
      feedback.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || feedback.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "new":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const handleResponse = (feedbackId, response) => {
    alert(`Response sent for feedback ${feedbackId}: ${response}`);
    // In real app, this would update the feedback in the database
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Customer Feedback
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and respond to customer feedback
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.map((feedback) => (
          <div
            key={feedback.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feedback.customerName}
                  </h3>
                  <p className="text-sm text-gray-500">{feedback.email}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  {getRatingStars(feedback.rating)}
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    feedback.status
                  )}`}
                >
                  {feedback.status}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">
                  {feedback.subject}
                </h4>
                <span className="text-sm text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {feedback.createdAt}
                </span>
              </div>
              <p className="text-gray-600">{feedback.message}</p>
              <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                {feedback.category}
              </span>
            </div>

            {feedback.response && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">
                  Your Response:
                </h5>
                <p className="text-blue-800">{feedback.response}</p>
              </div>
            )}

            {!feedback.response && (
              <div className="border-t border-gray-200 pt-4">
                <textarea
                  placeholder="Type your response here..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() =>
                      handleResponse(
                        feedback.id,
                        "Thank you for your feedback!"
                      )
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Send Response
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredFeedback.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No feedback found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No feedback matches your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;
