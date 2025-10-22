import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Feedback = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState("5");
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    message: "",
    email: "",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement feedback submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Feedback Submitted! Thank you for your valuable feedback.");
      navigate("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-500/5 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-gray-600 hover:text-gray-900 bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>

        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Feedback</h1>
          <p className="text-gray-600">Help us improve PigmyXpress</p>
        </div>

        {/* Feedback Form Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          {/* Card Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Share Your Experience
            </h2>
            <p className="text-gray-600 mt-1">
              Your feedback helps us serve you better
            </p>
          </div>

          {/* Card Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  How would you rate your experience?
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {["1", "2", "3", "4", "5"].map((value) => (
                    <div key={value} className="flex flex-col items-center">
                      <input
                        type="radio"
                        value={value}
                        id={`rating-${value}`}
                        checked={rating === value}
                        onChange={(e) => setRating(e.target.value)}
                        className="hidden peer"
                      />
                      <label
                        htmlFor={`rating-${value}`}
                        className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 text-lg font-semibold transition-all
                          ${
                            rating === value
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-gray-300 bg-gray-50 text-gray-700 hover:border-blue-300"
                          }`}
                      >
                        {value}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject Field */}
              <div className="space-y-2">
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700"
                >
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Brief description of your feedback"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Field */}
              <div className="space-y-2">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <input
                  id="category"
                  type="text"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., App Performance, Customer Service"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700"
                >
                  Your Feedback
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Please share your thoughts, suggestions, or concerns..."
                  rows={6}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email (Optional)
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500">
                  We'll only use this to follow up on your feedback
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md transition-colors"
              >
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
