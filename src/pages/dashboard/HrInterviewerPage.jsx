import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  listAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from "@/api/adminUsers";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEdit, 
  faTrash, 
  faUserPlus, 
  faUsers, 
  faUserTie, 
  faUserCog,
  faEye,
  faSearch,
  faFilter,
  faUser
} from "@fortawesome/free-solid-svg-icons";
import { safeToastError } from "@/utility/safeToast";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";
import Icon from "@/components/ui/Icon";

const emptyForm = { name: "", email: "", password: "", role: "" };

const HrInterviewerPage = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [formData, setFormData] = useState(emptyForm);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const data = await listAdminUsers(token);
      setUsers(data);
    } catch (err) {
      safeToastError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !user || user.role !== "SuperAdmin") {
      safeToastError("Access denied");
      navigate("/login");
      return;
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((d) => ({ ...d, [name]: value }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields for new user creation
    if (!editingId) {
      if (!formData.name.trim()) {
        toast.error("Name is required");
        return;
      }
      if (!formData.email.trim()) {
        toast.error("Email is required");
        return;
      }
      if (!formData.password.trim()) {
        toast.error("Password is required for new users");
        return;
      }
      if (!formData.role) {
        toast.error("Role is required");
        return;
      }
      
      // Check for duplicate email when creating new user
      const existingUser = users.find(user => user.email.toLowerCase() === formData.email.toLowerCase());
      if (existingUser) {
        toast.error("Email already exists. Please use a different email address.");
        return;
      }
    }
    
    // Validate required fields for editing
    if (editingId) {
      if (!formData.name.trim()) {
        toast.error("Name is required");
        return;
      }
      if (!formData.email.trim()) {
        toast.error("Email is required");
        return;
      }
      if (!formData.role) {
        toast.error("Role is required");
        return;
      }
      
      // Check for duplicate email when editing (excluding current user)
      const existingUser = users.find(user => 
        user.email.toLowerCase() === formData.email.toLowerCase() && 
        user.id !== editingId
      );
      if (existingUser) {
        toast.error("Email already exists. Please use a different email address.");
        return;
      }
    }
    
    setSubmitting(true);
    try {
      if (editingId) {
        // password optional when editing - only include if not empty
        const payload = { 
          name: formData.name,
          email: formData.email,
          role: formData.role
        };
        
        // Only add password to payload if it's not empty
        if (formData.password && formData.password.trim()) {
          payload.password = formData.password;
        }
        
        const updated = await updateAdminUser(token, editingId, payload);
        toast.success("User updated successfully");
        setUsers((u) => u.map((x) => (x.id === updated.id ? updated : x)));
      } else {
        const created = await createAdminUser(token, formData);
        toast.success("User created successfully");
        setUsers((u) => [created, ...u]);
      }
      resetForm();
    } catch (err) {
      // Only show toast for non-authentication errors
      if (
        err.response?.status !== 401 && 
        err.response?.status !== 403 &&
        err.message !== "Invalid credentials"
      ) {
        safeToastError("Save failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setFormData({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteAdminUser(token, id);
      toast.success("User deleted successfully");
      setUsers((u) => u.filter((x) => x.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      // Only show toast for non-authentication errors
      if (
        err.response?.status !== 401 && 
        err.response?.status !== 403 &&
        err.message !== "Invalid credentials"
      ) {
        safeToastError("Delete failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Filter and search users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role) => {
    return role === "HR" ? "bg-blue-500 text-white" : "bg-green-500 text-white";
  };

  const getRoleIcon = (role) => {
    return role === "HR" ? faUserTie : faUserCog;
  };

  const stats = {
    total: users.length,
    hr: users.filter(u => u.role === "HR").length,
    interviewer: users.filter(u => u.role === "Interviewer").length
  };

  const renderUserImage = (user) => {
    if (user.profile_image) {
      // Construct the proper image URL for backend uploads
      const imageUrl = `/uploads/profiles/${user.profile_image}`;
      return (
        <div className="relative">
          <img 
            src={imageUrl} 
            alt={user.name}
            className="h-10 w-10 rounded-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              // Show fallback icon
              const fallback = e.target.parentElement.querySelector('.fallback-icon');
              if (fallback) {
                fallback.style.display = 'flex';
              }
            }}
          />
          {/* Fallback icon that shows when image fails to load */}
          <div className="fallback-icon h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center absolute top-0 left-0" style={{display: 'none'}}>
            <FontAwesomeIcon icon={faUser} className="text-gray-500 text-sm" />
          </div>
        </div>
      );
    }
    
    return (
      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
        <FontAwesomeIcon icon={faUser} className="text-gray-500 text-sm" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow border rounded p-6">  
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HR & Interviewer Management</h1>
          <p className="text-gray-600">Manage your HR personnel and interviewers</p>
        </div>
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon icon={faUsers} className="text-4xl text-blue-500" />
        </div>
      </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white shadow border">
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:users" className="text-blue-600 text-2xl" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white shadow border">
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:user-circle" className="text-green-600 text-2xl" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-2xl font-bold text-gray-900">{stats.hr}</div>
              <div className="text-sm text-gray-600">HR Personnel</div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white shadow border">
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:user-gear" className="text-purple-600 text-2xl" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-2xl font-bold text-gray-900">{stats.interviewer}</div>
              <div className="text-sm text-gray-600">Interviewers</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Form Card */}
      <Card 
        title={editingId ? "Edit User" : "Add New User"}
        subtitle={editingId ? "Update user information" : "Create a new HR personnel or interviewer"}
        className="bg-white"
      >
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <Textinput
                name="name"
                value={formData.name}
                onChange={onChange}
                placeholder="Enter full name"
                required
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <Textinput
                name="email"
                value={formData.email}
                onChange={onChange}
                placeholder="user@example.com"
                type="email"
                required
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {editingId ? "Password (leave blank to keep)" : "Password *"}
              </label>
              <Textinput
                name="password"
                value={formData.password}
                onChange={onChange}
                placeholder={editingId ? "•••••• (optional)" : "Enter password"}
                type="password"
                className="w-full"
                required={!editingId}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Role</option>
                <option value="HR">HR Personnel</option>
                <option value="Interviewer">Interviewer</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{editingId ? "Updating..." : "Creating..."}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={editingId ? faEdit : faUserPlus} />
                  <span>{editingId ? "Update User" : "Create User"}</span>
                </div>
              )}
            </Button>
            
            {editingId && (
              <Button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Users List Card */}
      <Card 
        title="Manage Users"
        subtitle={`${filteredUsers.length} of ${users.length} users`}
        headerslot={
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Filter */}
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="HR">HR Only</option>
                <option value="Interviewer">Interviewer Only</option>
              </select>
            </div>
          </div>
        }
        className="bg-white"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading users...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faUsers} className="text-6xl text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">
              {users.length === 0 ? "No users have been added yet." : "No users match your search criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {renderUserImage(u)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{u.name}</div>
                          <div className="text-sm text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={getRoleIcon(u.role)} className="text-gray-400" />
                        <Badge 
                          label={u.role}
                          className={getRoleBadgeColor(u.role)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        label="Active"
                        className="bg-green-100 text-green-800"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => startEdit(u)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50"
                          title="Edit user"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(u.id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
                          title="Delete user"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default HrInterviewerPage;
