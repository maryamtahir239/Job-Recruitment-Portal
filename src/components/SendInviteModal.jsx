import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { safeToastError } from "@/utility/safeToast";
import DatePicker from "@/components/ui/DatePicker";
import Modal from "@/components/ui/Modal";
import Flatpickr from "react-flatpickr";

// Add onSendSuccess to the props
const SendInviteModal = ({ open, onClose, selectedCandidates, onSendSuccess, jobId }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // Calculate default expiry date (4 days from now)
  const getDefaultExpiryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 4);
    return date.toISOString().split('T')[0];
  };

  // Default expiry time (12:00 AM)
  const getDefaultExpiryTime = () => {
    return "12:00 AM";
  };

  const [expiryDate, setExpiryDate] = useState(getDefaultExpiryDate());
  const [expiryTime, setExpiryTime] = useState(getDefaultExpiryTime());

  useEffect(() => {
    if (open) {
      setMessage("");
      setLoading(false);
      setExpiryDate(getDefaultExpiryDate());
      setExpiryTime(getDefaultExpiryTime());
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const getCandidateIds = () => {
    return selectedCandidates
      .map((c) => c.id)
      .filter((id) => id != null && (typeof id === "number" || (typeof id === 'string' && /^\d+$/.test(id))));
  };

  const handleSendInvites = async () => {
    setLoading(true);

    try {
      const candidateIds = getCandidateIds();
      if (!candidateIds.length) {
        safeToastError("No valid candidate IDs found to send invites.");
        setLoading(false);
        return;
      }

      // Validate expiry date and time
      if (!expiryDate) {
        safeToastError("Please set an expiry date for the application links.");
        setLoading(false);
        return;
      }

      // Create expiry datetime string
      const expiryDateTime = `${expiryDate}T${expiryTime}:00`;

      toast.info("Sending application links...");

      const { data } = await axios.post("/api/invites/bulk", {
        candidateIds,
        jobId,
        message:
          message ||
          "Please complete your job application using the link provided.",
        expiryDate: expiryDateTime
      });

      if (data.success) {
        if (onSendSuccess) {
          onSendSuccess(data.sent || selectedCandidates.length); // Call parent callback with the actual sent count
        }
        onClose(); // Close modal on successful send
      } else {
        safeToastError(`Some invites failed. Sent: ${data.sent || 0}, Failed: ${data.failed || 0}. Check console for details.`);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        safeToastError(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK') {
        safeToastError("Network error. Please check your connection and try again.");
      } else {
        safeToastError("Failed to send invites. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      activeModal={open}
      onClose={onClose}
      enterFrom="scale-90 translate-y-5"
      leaveFrom="scale-100 translate-y-0"
    >
      <div className="w-full max-w-lg mx-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Send Application Links</h2>

        <p className="mb-4 text-gray-600">
          You are about to send application links to{" "}
          <strong className="text-blue-600">{selectedCandidates.length}</strong> candidate(s).
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Selected Candidates:</label>
          <div className="border border-gray-300 rounded-md bg-white overflow-hidden">
            <div className="max-h-32 overflow-y-auto p-3">
              {selectedCandidates.length === 0 ? (
                <p className="text-gray-500 text-center py-2">No candidates selected.</p>
              ) : (
                <ul className="space-y-1">
                  {selectedCandidates.map((c) => (
                    <li key={c.id} className="text-sm">
                      <span className="font-medium">{c.name}</span> 
                      <span className="text-blue-700 block text-xs">{c.email}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Custom Message (optional):</label>
          <textarea
            className="w-full border border-gray-300 p-3 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 ease-in-out"
            rows="3"
            placeholder="Custom message to include in the email..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Application Link Expiry:</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Date</label>
              <DatePicker
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="Select date"
                min={new Date().toISOString().split('T')[0]}
                disabled={loading}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Time</label>
              <Flatpickr
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={expiryTime}
                placeholder="Choose Time.."
                options={{
                  enableTime: true,
                  noCalendar: true,
                  dateFormat: "h:i K",
                  time_24hr: false,
                  defaultHour: 12,
                  defaultMinute: 0,
                }}
                onChange={(date) => {
                  if (date[0]) {
                    const hours = date[0].getHours().toString().padStart(2, '0');
                    const minutes = date[0].getMinutes().toString().padStart(2, '0');
                    setExpiryTime(`${hours}:${minutes}`);
                  }
                }}
                disabled={loading}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Application links will expire on {expiryDate} at {expiryTime}
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button text="Cancel" onClick={onClose} className="btn-secondary px-4 py-2" disabled={loading} />
          <Button
            text={loading ? "Sending..." : "Send Invites"}
            onClick={handleSendInvites}
            className="btn-primary px-4 py-2"
            disabled={loading || selectedCandidates.length === 0}
          />
        </div>
      </div>
    </Modal>
  );
};

export default SendInviteModal;