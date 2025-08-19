import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { addNotification } from "@/store/notificationsSlice";
import { toast } from "react-toastify";

const NotificationListener = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.auth?.user);

  useEffect(() => {
    // Only listen for interview related notifications when authenticated
    const socket = io(import.meta.env.VITE_API_BASE, {
      transports: ["websocket"],
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


