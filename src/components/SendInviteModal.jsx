import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";

// Add onSendSuccess to the props
const SendInviteModal = ({ open, onClose, selectedCandidates, onSendSuccess, jobId }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) {
      setMessage("");
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

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
        toast.error("No valid candidate IDs found to send invites.");
        setLoading(false);
        return;
      }

      toast.info("Sending application links...");

      const { data } = await axios.post("/api/invites/bulk", {
        candidateIds,
        jobId,
        message:
          message ||
          "Please complete your job application using the link provided.",
      });

      if (data.success) {
        if (onSendSuccess) {
          onSendSuccess(data.sent || selectedCandidates.length); // Call parent callback with the actual sent count
        }
        onClose(); // Close modal on successful send
      } else {
        toast.error(`Some invites failed. Sent: ${data.sent || 0}, Failed: ${data.failed || 0}. Check console for details.`);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK') {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error("Failed to send invites. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg max-h-[90vh] flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Send Application Links</h2>

        <p className="mb-3 text-gray-600">
          You are about to send application links to{" "}
          <strong className="text-blue-600">{selectedCandidates.length}</strong> candidate(s).
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Selected Candidates:</label>
          <div className="relative">
            <div className="w-full border border-gray-300 rounded-md shadow-sm bg-white overflow-hidden">
              <div className="max-h-40 overflow-y-auto p-2">
                {selectedCandidates.length === 0 ? (
                  <p className="text-gray-500 text-center py-2">No candidates selected.</p>
                ) : (
                  <ul className="list-disc list-inside space-y-1">
                    {selectedCandidates.map((c) => (
                      <li key={c.id}>
                        <span className="font-medium">{c.name}</span> (<span className="text-blue-700">{c.email}</span>)
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        <textarea
          className="w-full border border-gray-300 p-3 rounded-md mb-4 resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-150 ease-in-out"
          rows="4"
          placeholder="Custom message to include in the email (optional)..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
        ></textarea>

        <div className="flex justify-end space-x-3 mt-auto">
          <Button text="Cancel" onClick={onClose} className="btn-secondary px-5 py-2" disabled={loading} />
          <Button
            text={loading ? "Sending..." : "Send Invites"}
            onClick={handleSendInvites}
            className="btn-primary px-5 py-2"
            disabled={loading || selectedCandidates.length === 0}
          />
        </div>
      </div>
    </div>
  );
};

export default SendInviteModal;