import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { safeToastError } from "@/utility/safeToast";

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
    if (isSubmitting.current || isLoading) return;
    
    // Client-side validation
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    isSubmitting.current = true;
    setIsLoading(true);
    clearErrors();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.field) {
          // Set specific field error with more descriptive message
          let errorMessage = data.error;
          if (data.field === 'email' && data.error.includes('not found')) {
            errorMessage = "Please check your email address and enter the correct email!";
          } else if (data.field === 'password' && data.error.includes('Incorrect password')) {
            errorMessage = "Password is incorrect. Please check your password and try again!";
          }
          setErrors({ [data.field]: errorMessage });
          // No toast for field-specific errors
        } else {
          setErrors({ general: data.error || "Login failed" });
          safeToastError(data.error || "Login failed"); // Only for general errors
        }
        return;
      }

      if (!data.user || !data.token) {
        setErrors({ general: "Invalid response from server" });
        safeToastError("Invalid response from server");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Login successful");

      // Redirect based on role
      if (data.user.role === "SuperAdmin") navigate("/superadmin-dashboard");
      else if (data.user.role === "HR") navigate("/hr-dashboard");
      else if (data.user.role === "Interviewer") navigate("/interviewer-dashboard");
      else {
        setErrors({ general: "Unauthorized role" });
        safeToastError("Unauthorized role");
        return;
      }
    } catch (err) {
      setErrors({ general: err.message || "Server error" });
      safeToastError(err.message || "Server error");
    } finally {
      setIsLoading(false);
      isSubmitting.current = false;
    }
  };

  const handleInputChange = (field, value) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {/* General Error Display */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-600 font-medium">{errors.general}</p>
          </div>
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          disabled={isLoading}
          required
          className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.email 
              ? 'border-red-500 bg-red-50 focus:ring-red-500' 
              : 'border-gray-300 bg-white hover:border-gray-400'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
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
          className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.password 
              ? 'border-red-500 bg-red-50 focus:ring-red-500' 
              : 'border-gray-300 bg-white hover:border-gray-400'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        {errors.password && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.password}
          </p>
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
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isLoading 
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md'
        }`}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </div>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
};

export default LoginForm;
