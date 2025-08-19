import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { addNotification } from "@/store/notificationsSlice";
import { toast } from "react-toastify";

const NotificationListener = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.auth?.user);

  useEffect(() => {
    // Listen for check-in notifications
    const baseUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_BASE ||
      (typeof window !== "undefined"
        ? `${window.location.protocol}//${window.location.hostname}:3001`
        : "http://localhost:3001");

    const socket = io(baseUrl, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("candidate-arrived", (data) => {
      const name = data?.candidateName || "Candidate";
      dispatch(
        addNotification({
          title: "Candidate Arrived",
          message: `${name} has arrived for the interview!`,
          meta: { candidateId: data?.candidateId },
        })
      );
      toast.success(`${name} has arrived for the interview!`);
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, user]);

  return null;
};

export default NotificationListener;


