// src/pages/auth/Login.jsx
import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "./common/login-form";
import useDarkMode from "@/hooks/useDarkMode";
import Logo from "@/assets/images/logo/logo-c.svg";

const Login = () => {
  const [isDark] = useDarkMode();

  return (
    <div className="h-full grid w-full grow grid-cols-1 place-items-center pt-10 2xl:pt-0">
      <div className="max-w-[416px] mx-auto w-full space-y-6">
        <div className="text-center">
          <div className="h-[72px] w-[72px] mx-auto">
            <Link to="/">
              <img
                src={Logo}
                alt="Logo"
                className="object-contain object-center h-full"
              />
            </Link>
          </div>
          <div className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-1 mt-5">
            Welcome to the Portal
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Please sign in to continue
          </div>
        </div>

        <div className="p-6 auth-box">
          <LoginForm />
        </div>

        <div className="mt-8 flex justify-center text-xs text-gray-400 pb-10 2xl:pb-0">
          <a href="#">Privacy Notice</a>
          <div className="mx-3 my-1 w-px bg-gray-200" />
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
