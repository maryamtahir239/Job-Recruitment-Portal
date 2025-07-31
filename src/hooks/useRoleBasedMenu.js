import { useState, useEffect } from 'react';
import { superAdminMenuItems, hrMenuItems, interviewerMenuItems } from '@/mocks/data';

const useRoleBasedMenu = () => {
  const [menuItems, setMenuItems] = useState(hrMenuItems);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const getUserMenuItems = () => {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user) {
        setUserRole(null);
        return hrMenuItems; // Default fallback
      }

      setUserRole(user.role);

      switch (user.role) {
        case "SuperAdmin":
          return superAdminMenuItems;
        case "HR":
          return hrMenuItems;
        case "Interviewer":
          return interviewerMenuItems;
        default:
          return hrMenuItems; // Default fallback
      }
    };

    setMenuItems(getUserMenuItems());

    // Listen for storage changes (when user logs in/out)
    const handleStorageChange = () => {
      setMenuItems(getUserMenuItems());
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for changes when the component mounts or when localStorage changes
    const interval = setInterval(() => {
      const currentUser = JSON.parse(localStorage.getItem("user") || "null");
      if (currentUser?.role !== userRole) {
        setMenuItems(getUserMenuItems());
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [userRole]);

  return { menuItems, userRole };
};

export default useRoleBasedMenu; 