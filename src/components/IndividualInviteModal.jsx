import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { safeToastError } from "@/utility/safeToast";
import DatePicker from "@/components/ui/DatePicker";
import Modal from "@/components/ui/Modal";
import Flatpickr from "react-flatpickr";

const IndividualInviteModal = ({ open, onClose, candidate, onSendSuccess, jobId }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryTime, setExpiryTime] = useState("");
  const [errors, setErrors] = useState({});

  // Debug logging
  console.log("IndividualInviteModal render:", { open, candidate, jobId });

  // Calculate default expiry date (4 days from now)
  const getDefaultExpiryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 4);
    return date.toISOString().split('T')[0];
  };
  const getDefaultExpiryTime = () => "12:00 AM";

  useEffect(() => {
    if (open && candidate) {
      setMessage("");
      setLoading(false);
      setExpiryDate(getDefaultExpiryDate());
      setExpiryTime(getDefaultExpiryTime());
      setInterviewDate("");
      setInterviewTime("");
      setErrors({});
    }
  }, [open, candidate]);

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

  // Early return if modal shouldn't be shown
  if (!open) {
    return null;
  }

  // Helper to convert 'hh:mm' and AM/PM to 24-hour format
  function to24Hour(timeStr) {
    if (!timeStr) return '00:00';
    // If already in 24-hour format (e.g., '14:30'), return as is
    if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
    // If in 12-hour format (e.g., '4:15 PM')
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return timeStr;
    let [_, h, m, ampm] = match;
    h = parseInt(h, 10);
    if (ampm.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${m}`;
  }

  const handleSendInvite = async () => {
    const newErrors = {};
    if (!interviewDate) newErrors.interviewDate = "Interview date is required.";
    if (!interviewTime) newErrors.interviewTime = "Interview time is required.";
    if (!expiryDate) newErrors.expiryDate = "Expiry date is required.";
    if (!expiryTime) newErrors.expiryTime = "Expiry time is required.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      if (!candidate?.id) {
        safeToastError("No valid candidate ID found to send invite.");
        setLoading(false);
        return;
      }
      // Convert times to 24-hour format
      const expiry24 = to24Hour(expiryTime);
      const interview24 = to24Hour(interviewTime);
      const expiryDateTime = `${expiryDate}T${expiry24}:00`;
      const interviewDateTime = `${interviewDate}T${interview24}:00`;
      toast.info("Sending application link...");
      const { data } = await axios.post("/api/invites/bulk", {
        candidateIds: [candidate.id],
        jobId,
        message: message || "Please complete your job application using the link provided.",
        expiryDate: expiryDateTime,
        interviewDateTime: interviewDateTime
      });
      if (data.success) {
        if (onSendSuccess) onSendSuccess(data.sent || 1);
        onClose();
      } else {
        safeToastError(`Failed to send invite. Please try again.`);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        safeToastError(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK') {
        safeToastError("Network error. Please check your connection and try again.");
      } else {
        safeToastError("Failed to send invite. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}  // Changed from activeModal to open
      onClose={onClose}
      enterFrom="scale-90 translate-y-5"
      leaveFrom="scale-100 translate-y-0"
      className="max-w-2xl"
    >
      <div className="w-full">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Send Application Link</h2>
        
        <p className="mb-4 text-gray-600">
          You are about to send an application link to{" "}
          <strong className="text-blue-600">{candidate?.name}</strong> ({candidate?.email}).
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Candidate Details:</label>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <div><strong>Name:</strong> {candidate?.name || 'N/A'}</div>
              <div><strong>Email:</strong> {candidate?.email || 'N/A'}</div>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Custom Message (optional):</label>
          <textarea
            className="w-full border border-gray-300 p-3 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 ease-in-out"
            rows="3"
            placeholder="Add a personal message to include in the email..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">Interview Schedule:</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Interview Date<span className="text-red-500">*</span></label>
              <DatePicker
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                placeholder="Select date"
                min={new Date().toISOString().split('T')[0]}
                disabled={loading}
                className="w-full"
              />
              {errors.interviewDate && <div className="text-xs text-red-600 mt-1">{errors.interviewDate}</div>}
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Interview Time<span className="text-red-500">*</span></label>
              <Flatpickr
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={interviewTime}
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
                    setInterviewTime(`${hours}:${minutes}`);
                  }
                }}
                disabled={loading}
              />
              {errors.interviewTime && <div className="text-xs text-red-600 mt-1">{errors.interviewTime}</div>}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Application Link Expiry:</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Expiry Date<span className="text-red-500">*</span></label>
              <DatePicker
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="Select date"
                min={new Date().toISOString().split('T')[0]}
                disabled={loading}
                className="w-full"
              />
              {errors.expiryDate && <div className="text-xs text-red-600 mt-1">{errors.expiryDate}</div>}
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Expiry Time<span className="text-red-500">*</span></label>
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
              {errors.expiryTime && <div className="text-xs text-red-600 mt-1">{errors.expiryTime}</div>}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Application link will expire on {expiryDate} at {expiryTime}
          </p>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button text="Cancel" onClick={onClose} className="btn-secondary px-4 py-2" disabled={loading} />
          
          <Button
            text={loading ? "Sending..." : "Send Invite"}
            onClick={handleSendInvite}
            className="btn-primary px-4 py-2"
            disabled={loading}
          />
        </div>
      </div>
    </Modal>
  );
};

export default IndividualInviteModal;