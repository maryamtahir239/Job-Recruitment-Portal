import React, { useState, useEffect, useRef } from "react";
import Dropdown from "@/components/ui/Dropdown";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { Menu, Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logOut } from "@/store/api/auth/authSlice";
import clsx from "clsx";
import { toast } from "react-toastify";
import { getUserProfile, updateProfileImage, removeProfileImage, updateUserName } from "@/api/userProfile";
import ResetPasswordModal from "@/components/ResetPasswordModal";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import { safeToastError } from "@/utility/safeToast";

// Default avatar placeholder
const DefaultAvatar = ({ size = "w-12 h-12" }) => (
  <div className={`${size} bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center`}>
    <Icon icon="ph:user-circle" className="text-2xl text-gray-500 dark:text-gray-400" />
  </div>
);

const ProfileLabel = ({ sticky, profileImage, onImageClick, showHoverActions, onRemovePhoto }) => {
  const size = sticky ? "h-9 w-9" : "lg:h-12 lg:w-12 h-7 w-7";
  
  return (
    <div className="relative group">
      <div
        className={clsx("rounded-full transition-all duration-300 cursor-pointer", size)}
        onClick={onImageClick}
      >
        {profileImage ? (
          <img
            src={`http://localhost:3001/uploads/profiles/${profileImage}`}
            alt="Profile"
        className="block w-full h-full object-cover rounded-full ring-1 ring-indigo-700 ring-offset-4 dark:ring-offset-gray-700"
      />
        ) : (
          <DefaultAvatar size={size} />
        )}
      </div>
      
      {/* Hover actions for profile image - only show when dropdown is open */}
      {showHoverActions && profileImage && (
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onImageClick();
              }}
              className="p-1 bg-white rounded-full text-gray-700 hover:bg-gray-100"
              title="Change Photo"
            >
              <Icon icon="ph:camera" className="text-sm" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemovePhoto();
              }}
              className="p-1 bg-white rounded-full text-red-600 hover:bg-red-50"
              title="Remove Photo"
            >
              <Icon icon="ph:trash" className="text-sm" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Profile = ({ sticky }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [updatingName, setUpdatingName] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    setUser(userData);
    if (userData && token) {
      fetchUserProfile();
    }
  }, []); // Empty dependency array - only run once on mount

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const profile = await getUserProfile(token);
      setUserProfile(profile);
    } catch (error) {
      // Only show toast for non-authentication errors
      if (
        error?.response?.status !== 401 &&
        error?.response?.status !== 403 &&
        error?.response?.data?.error !== "Invalid credentials"
      ) {
        safeToastError("Failed to fetch user profile");
      }
      // else: silent fail for auth errors
    }
  };

  const handleImageClick = () => {
    // Toggle dropdown instead of opening file upload
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      safeToastError("Invalid file type. Only JPEG, PNG, and GIF are allowed.");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      safeToastError("File size too large. Maximum size is 5MB.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const result = await updateProfileImage(token, file);
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        profile_image: result.profile_image
      }));
      
      // Update localStorage user data
      const updatedUser = { ...user, profile_image: result.profile_image };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success("Profile image updated successfully");
    } catch (error) {
      safeToastError(error.message || "Failed to update profile image");
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!userProfile?.profile_image) return;

    try {
      const token = localStorage.getItem("token");
      await removeProfileImage(token);
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        profile_image: null
      }));
      
      // Update localStorage user data
      const updatedUser = { ...user, profile_image: null };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success("Profile image removed successfully");
    } catch (error) {
      safeToastError(error.message || "Failed to remove profile image");
    }
  };

  const handleEditName = () => {
    setNewName(userProfile?.name || user?.name || "");
    setShowEditNameModal(true);
    setIsDropdownOpen(false); // Close dropdown when opening modal
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      safeToastError("Name cannot be empty");
      return;
    }

    setUpdatingName(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        safeToastError("Authentication token not found. Please login again.");
        return;
      }
      
      const result = await updateUserName(token, newName.trim());
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        name: result.name
      }));
      
      // Update localStorage user data
      const updatedUser = { ...user, name: result.name };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success("Name updated successfully");
      setShowEditNameModal(false);
    } catch (error) {
      console.error("Error updating name:", error);
      safeToastError(error.message || "Failed to update name");
    } finally {
      setUpdatingName(false);
    }
  };

  const handleLogout = () => {
    setUserProfile(null); // clear profile state
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    dispatch(logOut());
    navigate("/login");
  };

  const handleResetPassword = () => {
    setShowResetPasswordModal(true);
    setIsDropdownOpen(false); // Close dropdown when opening modal
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="relative">
        {/* Profile Picture Button */}
        <div
          className="cursor-pointer"
          onClick={handleImageClick}
        >
          <ProfileLabel 
            sticky={sticky} 
            profileImage={userProfile?.profile_image}
            onImageClick={handleImageClick}
            showHoverActions={false} // Disable hover actions for now
            onRemovePhoto={handleRemovePhoto}
          />
        </div>

        {/* Dropdown Menu - Sticky to navbar */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-[280px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            {/* User Info Section */}
            <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex-none ltr:mr-[10px] rtl:ml-[10px]">
          <div className="h-[46px] w-[46px] rounded-full">
                  {userProfile?.profile_image ? (
            <img
                      src={`http://localhost:3001/uploads/profiles/${userProfile.profile_image}`}
                      alt="Profile"
              className="block w-full h-full object-cover rounded-full"
            />
                  ) : (
                    <DefaultAvatar size="w-[46px] h-[46px]" />
                  )}
          </div>
        </div>
              <div className="flex-1 text-gray-700 dark:text-white text-sm font-semibold">
                <span className="truncate w-full block">
                  {userProfile?.name || user?.name || "User"}
                </span>
                <span className="block font-light text-xs capitalize">
                  {userProfile?.role || user?.role || "User"}
          </span>
        </div>
      </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* Edit Name Option */}
              <div
                onClick={handleEditName}
                className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <span className="flex-none h-9 w-9 inline-flex items-center justify-center rounded-full text-2xl text-white bg-green-500 mr-3">
                  <Icon icon="ph:user-circle" />
                </span>
                <span className="text-sm">Edit Name</span>
              </div>

              {/* Upload Photo Option - only show if user doesn't have a profile image */}
              {!userProfile?.profile_image && (
                <div
                  onClick={handleFileUpload}
                  className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <span className="flex-none h-9 w-9 inline-flex items-center justify-center rounded-full text-2xl text-white bg-blue-500 mr-3">
                    <Icon icon="ph:camera" />
                  </span>
                  <span className="text-sm">Upload Photo</span>
                </div>
              )}

              {/* Change Photo Option - only show if user has a profile image */}
              {userProfile?.profile_image && (
                <div
                  onClick={handleFileUpload}
                  className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <span className="flex-none h-9 w-9 inline-flex items-center justify-center rounded-full text-2xl text-white bg-blue-500 mr-3">
                    <Icon icon="ph:camera" />
                  </span>
                  <span className="text-sm">Change Photo</span>
                </div>
              )}

              {/* Remove Photo Option - only show if user has a profile image */}
              {userProfile?.profile_image && (
                <div
                  onClick={handleRemovePhoto}
                  className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <span className="flex-none h-9 w-9 inline-flex items-center justify-center rounded-full text-2xl text-white bg-red-500 mr-3">
                    <Icon icon="ph:trash" />
                  </span>
                  <span className="text-sm">Remove Photo</span>
                </div>
              )}

              {/* Reset Password Option */}
              <div
                onClick={handleResetPassword}
                className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <span className="flex-none h-9 w-9 inline-flex items-center justify-center rounded-full text-2xl text-white bg-indigo-500 mr-3">
                  <Icon icon="ph:lock-key" />
                </span>
                <span className="text-sm">Reset Password</span>
              </div>

              {/* Logout Option */}
              <div
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white cursor-pointer transition-colors border-t border-gray-100 dark:border-gray-700 mt-2"
              >
                <span className="flex-none h-9 w-9 inline-flex items-center justify-center rounded-full text-2xl text-white bg-red-500 mr-3">
                  <Icon icon="ph:sign-out" />
                </span>
                <span className="text-sm">Logout</span>
              </div>
                </div>
              </div>
            )}

        {/* Backdrop to close dropdown when clicking outside */}
        {isDropdownOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
        )}
      </div>

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
      />

      {/* Edit Name Modal */}
      <Modal
        open={showEditNameModal}
        onClose={() => setShowEditNameModal(false)}
        title="Edit Name"
        label="Edit Name Form"
      >
        <div className="space-y-6">
          <Textinput
            label="Full Name"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
          
          <div className="flex justify-end space-x-3">
            <Button
              text="Cancel"
              className="btn-outline-secondary"
              onClick={() => setShowEditNameModal(false)}
              type="button"
            />
            <Button
              text="Update Name"
              className="btn-primary"
              onClick={handleUpdateName}
              disabled={updatingName}
              isLoading={updatingName}
            />
          </div>
      </div>
      </Modal>
    </>
  );
};

export default Profile;
