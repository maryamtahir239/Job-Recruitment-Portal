import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function CheckInPage() {
  const { token } = useParams();
  const [status, setStatus] = useState({ loading: true, code: "", message: "" });

  const statusStyles = {
    success: {
      bg: "bg-green-100",
      icon: "✅",
      title: "Check-In Successful",
      textColor: "text-green-700"
    },
    too_early: {
      bg: "bg-yellow-100",
      icon: "⏳",
      title: "Too Early",
      textColor: "text-yellow-700"
    },
    too_late: {
      bg: "bg-red-100",
      icon: "⏰",
      title: "Too Late",
      textColor: "text-red-700"
    },
    wrong_location: {
      bg: "bg-red-100",
      icon: "📍",
      title: "Wrong Location",
      textColor: "text-red-700"
    },
    location_required: {
      bg: "bg-gray-100",
      icon: "📍",
      title: "Location Required",
      textColor: "text-gray-700"
    },
    invalid_link: {
      bg: "bg-gray-100",
      icon: "❌",
      title: "Invalid Link",
      textColor: "text-gray-700"
    },
    server_error: {
      bg: "bg-red-100",
      icon: "⚠️",
      title: "Server Error",
      textColor: "text-red-700"
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await axios.get(`/api/checkin/checkin/${token}`, {
            params: { lat: latitude, lng: longitude }
          });
          setStatus({
            loading: false,
            code: res.data.statusCode || "success",
            message: res.data.message || ""
          });
        } catch (err) {
          const data = err.response?.data || {};
          setStatus({
            loading: false,
            code: data.statusCode || "server_error",
            message: data.error || "Something went wrong"
          });
        }
      },
      () => {
        setStatus({
          loading: false,
          code: "location_required",
          message: "Location permission denied."
        });
      }
    );
  }, [token]);

  if (status.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-6 bg-white rounded-lg shadow-md text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-700">Checking your status...</p>
        </div>
      </div>
    );
  }

  const style = statusStyles[status.code] || statusStyles.server_error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div
        className={`p-8 rounded-lg shadow-lg w-full max-w-md text-center ${style.bg}`}
      >
        <div className="text-5xl mb-4">{style.icon}</div>
        <h1 className={`text-2xl font-bold mb-2 ${style.textColor}`}>
          {style.title}
        </h1>
        <p className={`${style.textColor} text-lg`}>{status.message}</p>
      </div>
    </div>
  );
}
