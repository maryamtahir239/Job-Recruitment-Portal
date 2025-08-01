import React, { useRef, useEffect, useState } from "react";

import Navmenu from "./Navmenu";
import useRoleBasedMenu from "@/hooks/useRoleBasedMenu";
import SimpleBar from "simplebar-react";
import useSemiDark from "@/hooks/useSemiDark";
import useDarkMode from "@/hooks/useDarkMode";
import { Link } from "react-router-dom";
import useMobileMenu from "@/hooks/useMobileMenu";
import Icon from "@/components/ui/Icon";

// import images
import MobileLogo from "@/assets/images/logo/logo-c.svg";
import MobileLogoWhite from "@/assets/images/logo/logo-c-white.svg";
import svgRabitImage from "@/assets/images/svg/rabit.svg";

const MobileMenu = ({ className = "custom-class" }) => {
  const scrollableNodeRef = useRef();
  const [scroll, setScroll] = useState(false);
  const { menuItems } = useRoleBasedMenu();

  useEffect(() => {
    const handleScroll = () => {
      if (scrollableNodeRef.current.scrollTop > 0) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    };
    scrollableNodeRef.current.addEventListener("scroll", handleScroll);
  }, [scrollableNodeRef]);

  const [isSemiDark] = useSemiDark();
  const [isDark] = useDarkMode();
  const [mobileMenu, setMobileMenu] = useMobileMenu();
  
  return (
    <div className={isSemiDark ? "dark" : ""}>
      <div
        className={`${className} fixed  top-0 bg-white dark:bg-gray-800 shadow-lg  h-full   w-[280px]`}
      >
        <div className="logo-segment flex justify-between items-center bg-white dark:bg-gray-800 z-[9] h-[85px]  px-4 ">
          <Link to="/dashboard">
            <div className="flex items-center space-x-4">
              <div className="logo-icon">
                {!isDark && !isSemiDark ? (
                  <img src={MobileLogo} alt="" />
                ) : (
                  <img src={MobileLogoWhite} alt="" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                  Job Recruitment Portal
                </h1>
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenu(!mobileMenu)}
            className="cursor-pointer text-gray-900 dark:text-white text-2xl"
          >
            <Icon icon="heroicons:x-mark" />
          </button>
        </div>

        <div
          className={`h-[60px]  absolute top-[80px] nav-shadow z-[1] w-full transition-all duration-200 pointer-events-none ${
            scroll ? " opacity-100" : " opacity-0"
          }`}
        ></div>
        <SimpleBar
          className="sidebar-menu  h-[calc(100%-80px)]"
          scrollableNodeProps={{ ref: scrollableNodeRef }}
        >
          <Navmenu menus={menuItems} />
        </SimpleBar>
      </div>
    </div>
  );
};

export default MobileMenu;
