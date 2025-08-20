import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function CheckInPage() {
  const { token } = useParams();
  const [status, setStatus] = useState({ loading: true, code: "", message: "", details: null });
  const [lastCoords, setLastCoords] = useState(null);
  const [permissionState, setPermissionState] = useState("prompt");
  const permissionRef = useRef(null);

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
    },
    already_checked_in: {
  bg: "bg-blue-100",
  icon: "ℹ️",
  title: "Already Checked In",
  textColor: "text-blue-700"
}

  };

  const requestLocationAndCheckIn = async () => {
    setStatus((s) => ({ ...s, loading: true }));
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setLastCoords({ lat: latitude, lng: longitude, ts: Date.now() });
          const res = await axios.get(`/api/checkin/checkin/${token}`, {
            params: { lat: latitude, lng: longitude }
          });
          setStatus({
            loading: false,
            code: res.data.statusCode || "success",
            message: res.data.message || "",
            details: res.data.details || null,
          });
        } catch (err) {
          const data = err.response?.data || {};
          setStatus({
            loading: false,
            code: data.statusCode || "server_error",
            message: data.error || "Something went wrong",
            details: data.details || null,
          });
        }
      },
      (error) => {
        let message = "Location permission denied.";
        if (error?.code === error.POSITION_UNAVAILABLE) message = "Unable to determine your location.";
        if (error?.code === error.TIMEOUT) message = "Getting location timed out. Please try again near a window or outdoors.";
        setStatus({ loading: false, code: "location_required", message, details: null });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (!navigator.permissions || !navigator.permissions.query) {
      requestLocationAndCheckIn();
      return;
    }
    navigator.permissions
      .query({ name: "geolocation" })
      .then((perm) => {
        permissionRef.current = perm;
        setPermissionState(perm.state);
        // Always attempt to request location; browser will prompt if possible
        requestLocationAndCheckIn();
        if (perm.state === "denied") {
          setStatus({
            loading: false,
            code: "location_required",
            message: "Please enable location access for this site and try again.",
            details: null,
          });
        }
        // Listen for permission changes and retry automatically when granted
        perm.onchange = () => {
          setPermissionState(perm.state);
          if (perm.state === "granted") {
            requestLocationAndCheckIn();
          }
        };
      })
      .catch(() => {
        requestLocationAndCheckIn();
      });
  }, [token]);

  const openSiteSettings = () => {
    const origin = window.location.origin;
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("edg/")) {
      window.open(`edge://settings/content/siteDetails?site=${encodeURIComponent(origin)}`, "_blank");
      return;
    }
    if (ua.includes("chrome") && !ua.includes("edg/")) {
      window.open(`chrome://settings/content/siteDetails?site=${encodeURIComponent(origin)}`, "_blank");
      return;
    }
    // Fallback: open generic settings help page
    window.open("https://support.google.com/chrome/answer/142065?hl=en", "_blank");
  };

  if (status.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="p-6 bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-md text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-700">Checking your status...</p>
        </div>
      </div>
    );
  }

  const style = statusStyles[status.code] || statusStyles.server_error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div
        className={`p-8 rounded-lg shadow-lg w-full max-w-md text-center ${style.bg} dark:bg-gray-800 dark:text-gray-100`}
      >
        <div className="text-5xl mb-4">{style.icon}</div>
        <h1 className={`text-2xl font-bold mb-2 ${style.textColor}`}>
          {style.title}
        </h1>
        <p className={`${style.textColor} text-lg`}>{status.message}</p>
        {lastCoords && (
          <div className="mt-2 text-xs text-gray-600">
            Your location: {lastCoords.lat.toFixed(6)}, {lastCoords.lng.toFixed(6)}
          </div>
        )}
        {status.details && (
          <div className="mt-3 text-xs text-gray-600">
            Distance: {status.details.distanceMeters}m (allowed {status.details.allowedMeters}m)
            <div>Office: {status.details.office?.lat}, {status.details.office?.lng}</div>
            <div>Received: {status.details.received?.lat}, {status.details.received?.lng}</div>
          </div>
        )}
        {status.code === "location_required" && (
          <div className="mt-4 text-left text-sm">
            <div className="mb-3">
              Please enable location access for this site:
            </div>
            <ul className="list-disc ml-6 space-y-1">
              <li>Click the lock icon in your browser's address bar.</li>
              <li>Find Location permission and set it to Allow.</li>
              <li>Reload this page and try again.</li>
            </ul>
            <div className="mt-4">
              <button
                onClick={requestLocationAndCheckIn}
                className="btn btn-primary"
              >
                Enable Location and Retry
              </button>
              <button
                onClick={openSiteSettings}
                className="btn btn-outline ml-2"
              >
                Open Site Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
