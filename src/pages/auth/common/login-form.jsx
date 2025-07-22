import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // ✅ FIX added this state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // ✅ Role-based Redirect
      const role = data.user?.role;
      if (!role) throw new Error("Invalid user data");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Login successful");

      if (role === "SuperAdmin") navigate("/superadmin-dashboard");
      else if (role === "HR") navigate("/hr-dashboard");
      else if (role === "Interviewer") navigate("/interviewer-dashboard");
      else throw new Error("Unauthorized role");
    } catch (err) {
      console.error("🔥 Login error:", err.message);
      toast.error(err.message || "Server error");
    } finally {
      setIsLoading(false);
    }
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
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
          className="form-input w-full"
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block mb-1 text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
          className="form-input w-full"
        />
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
