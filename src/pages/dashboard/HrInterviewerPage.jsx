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
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons"; // Import FontAwesome icons for edit and delete
import { safeToastError } from "@/utility/safeToast";

const emptyForm = { name: "", email: "", password: "", role: "HR" };

const HrInterviewerPage = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [formData, setFormData] = useState(emptyForm);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listAdminUsers(token);
      setUsers(data);
    } catch (err) {
      // Only show toast for non-authentication errors
      if (
        err.response?.status !== 401 &&
        err.response?.status !== 403 &&
        err.message !== "Invalid credentials" &&
        err.response?.data?.error !== "Invalid credentials"
      ) {
        safeToastError("Failed to load users");
      }
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
    setSubmitting(true);
    try {
      if (editingId) {
        // password optional when editing
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        const updated = await updateAdminUser(token, editingId, payload);
        toast.success("User updated");
        setUsers((u) => u.map((x) => (x.id === updated.id ? updated : x)));
      } else {
        const created = await createAdminUser(token, formData);
        toast.success("User created");
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
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteAdminUser(token, id);
      toast.success("User deleted");
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
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">HR / Interviewer Management</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-4 border rounded bg-white shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={onChange}
            required
            className="w-full border border-gray-300 rounded py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="Full name"
            type="text"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            value={formData.email}
            onChange={onChange}
            required
            className="w-full border border-gray-300 rounded py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="user@example.com"
            type="email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {editingId ? "Password (leave blank to keep)" : "Password"}
          </label>
          <input
            name="password"
            value={formData.password}
            onChange={onChange}
            className="w-full border border-gray-300 rounded py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder={editingId ? "•••••• (optional)" : "Password"}
            type="password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="HR">HR</option>
            <option value="Interviewer">Interviewer</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary px-4 py-2"
          >
            {editingId ? "Update User" : "Create User"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="btn btn-secondary px-4 py-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Added HR / Interviewers</h2>
        {loading ? (
          <p>Loading...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border text-center">ID</th>
                  <th className="p-2 border text-center">Name</th>
                  <th className="p-2 border text-center">Email</th>
                  <th className="p-2 border text-center">Role</th>
                  <th className="p-2 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="p-2 border text-center">{u.id}</td>
                    <td className="p-2 border text-center">{u.name}</td>
                    <td className="p-2 border text-center">{u.email}</td>
                    <td className="p-2 border text-center">{u.role}</td>
                    <td className="p-2 border text-center space-x-2">
                      {/* Edit Icon */}
                      <button
                        type="button"
                        onClick={() => startEdit(u)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      {/* Delete Icon */}
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HrInterviewerPage;
