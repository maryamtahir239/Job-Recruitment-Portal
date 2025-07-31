import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const isSubmitting = useRef(false);

  const clearErrors = () => {
    setErrors({});
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting.current || isLoading) {
      return;
    }
    
    isSubmitting.current = true;
    setIsLoading(true);
    clearErrors();

    console.log("LoginForm: Starting login process...");

    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("LoginForm: Response received:", { status: res.status, ok: res.ok, data });

      if (!res.ok) {
        console.log("LoginForm: Login failed with error:", data);
        // Handle specific error messages
        if (data.field) {
          // Field-specific error
          setErrors({ [data.field]: data.error });
          toast.error(data.error);
        } else {
          // General error
          toast.error(data.error || "Login failed");
        }
        return;
      }

      // Check if we have valid user data
      if (!data.user || !data.token) {
        console.log("LoginForm: Invalid response data:", data);
        toast.error("Invalid response from server");
        return;
      }

      // ✅ Role-based Redirect
      const role = data.user?.role;
      if (!role) {
        console.log("LoginForm: No role in user data:", data.user);
        toast.error("Invalid user data");
        return;
      }

      console.log("LoginForm: Login successful for role:", role);

      // Store user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Show success message
      toast.success("Login successful");

      // Navigate based on role
      if (role === "SuperAdmin") {
        navigate("/superadmin-dashboard");
      } else if (role === "HR") {
        navigate("/hr-dashboard");
      } else if (role === "Interviewer") {
        navigate("/interviewer-dashboard");
      } else {
        toast.error("Unauthorized role");
        return;
      }
    } catch (err) {
      console.error("LoginForm: Login error:", err);
      toast.error(err.message || "Server error");
    } finally {
      setIsLoading(false);
      isSubmitting.current = false;
    }
  };

  const handleInputChange = (field, value) => {
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block mb-1 text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          disabled={isLoading}
          required
          className={`form-input w-full ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block mb-1 text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          disabled={isLoading}
          required
          className={`form-input w-full ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex justify-between items-center">
        <label className="inline-flex items-center text-sm">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            className="form-checkbox"
          />
          <span className="ml-2">Remember me</span>
        </label>
        <a
          href="#"
          className="text-sm text-gray-400 hover:text-indigo-500 hover:underline"
        >
          Forgot Password?
        </a>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
};

export default LoginForm;
