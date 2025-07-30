import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import { resetPassword } from "@/api/userProfile";
import { toast } from "react-toastify";

const ResetPasswordModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await resetPassword(token, formData.currentPassword, formData.newPassword);
      
      toast.success("Password updated successfully");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      title="Reset Password"
      labelclassName="btn-primary"
      open={isOpen}
      onClose={handleClose}
      sizeClass="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textinput
          name="currentPassword"
          type="password"
          label="Current Password"
          placeholder="Enter your current password"
          value={formData.currentPassword}
          onChange={handleChange}
          error={errors.currentPassword}
        />

        <Textinput
          name="newPassword"
          type="password"
          label="New Password"
          placeholder="Enter your new password"
          value={formData.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
        />

        <Textinput
          name="confirmPassword"
          type="password"
          label="Confirm New Password"
          placeholder="Confirm your new password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            text="Cancel"
            className="btn-outline-danger flex-1"
            onClick={handleClose}
            disabled={loading}
          />
          <Button
            type="submit"
            text={loading ? "Updating..." : "Update Password"}
            className="btn-primary flex-1"
            disabled={loading}
          />
        </div>
      </form>
    </Modal>
  );
};

export default ResetPasswordModal; 