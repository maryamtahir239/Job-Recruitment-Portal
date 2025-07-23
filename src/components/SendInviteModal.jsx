// src/components/SendInviteModal.jsx
import React, { useState } from "react";
import axios from "axios";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify"; // Use existing toast

const SendInviteModal = ({ open, onClose, selectedCandidates }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!open) return null;

  // Extract candidate IDs (real DB IDs after import)
  const getCandidateIds = () => {
    return selectedCandidates
      .map((c) => c.id)
      .filter((id) => typeof id === "number" || /^\d+$/.test(id));
  };

  const handleSendInvites = async () => {
    setLoading(true);

    try {
      const candidateIds = getCandidateIds();
      if (!candidateIds.length) {
        toast.error("No valid candidate IDs found.");
        setLoading(false);
        return;
      }

      const { data } = await axios.post("/api/invites/bulk", {
        candidateIds,
        message:
          message ||
          "Please complete your job application using the link provided.",
      });

      if (data.success) {
        toast.success("Emails sent to candidates.");
        onClose(); // Close modal after success
      } else {
        toast.error(`Some invites failed. Sent: ${data.sent}, Failed: ${data.failed}`);
      }
    } catch (err) {
      console.error("Send invites failed:", err);
      toast.error("Server error while sending invites.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Send Application Links</h2>

        <p className="mb-3 text-gray-600">
          You are about to send application links to{" "}
          <strong>{selectedCandidates.length}</strong> candidate(s).
        </p>
        <ul className="max-h-40 overflow-auto border p-2 rounded mb-4 text-sm">
          {selectedCandidates.map((c) => (
            <li key={c.id}>
              {c.name} ({c.email})
            </li>
          ))}
        </ul>

        <textarea
          className="w-full border p-2 rounded mb-4"
          rows="3"
          placeholder="Custom message to include in the email..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>

        <div className="flex justify-end space-x-3">
          <Button text="Cancel" onClick={onClose} className="btn-secondary" disabled={loading} />
          <Button
            text={loading ? "Sending..." : "Send Invites"}
            onClick={handleSendInvites}
            className="btn-primary"
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default SendInviteModal;
