import React from "react";
import Dropdown from "@/components/ui/Dropdown";
import { Menu } from "@headlessui/react";
import { useDispatch, useSelector } from "react-redux";
import { markAllAsRead, markAsRead, deleteAll } from "@/store/notificationsSlice";

const BellIcon = ({ showDot }) => {
  return (
    <span className="relative">
      <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 18.8476C17.6392 18.8476 20.2481 18.1242 20.5 15.2205C20.5 12.3188 18.6812 12.5054 18.6812 8.94511C18.6812 6.16414 16.0452 3 12 3C7.95477 3 5.31885 6.16414 5.31885 8.94511C5.31885 12.5054 3.5 12.3188 3.5 15.2205C3.75295 18.1352 6.36177 18.8476 12 18.8476Z"
          className="stroke-gray-600 dark:stroke-gray-100"
          strokeWidth="1.5"
          strokeLinecap="round"
        ></path>
        <path
          d="M14.3889 21.8572C13.0247 23.372 10.8967 23.3899 9.51953 21.8572"
          className="stroke-gray-600 dark:stroke-gray-100"
          strokeWidth="1.5"
          strokeLinecap="round"
        ></path>
      </svg>
      {showDot ? (
        <span className="absolute right-1 top-0 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 ring-1 ring-white"></span>
        </span>
      ) : null}
    </span>
  );
};

function timeAgo(iso) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

const Notification = () => {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.notifications.items);
  const unread = useSelector((s) => s.notifications.unreadCount);

  return (
    <div className="md:block hidden">
      <Dropdown classMenuItems="md:w-[380px] top-[30px]" label={<BellIcon showDot={unread > 0} />}>
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <div className="text-sm text-gray-800 dark:text-gray-200 font-semibold leading-6">New notifications</div>
          <div className="flex items-center gap-3">
            <button onClick={() => dispatch(markAllAsRead())} className="text-xs text-indigo-600 hover:underline">Mark as Read</button>
            <button onClick={() => dispatch(deleteAll())} className="text-xs text-red-600 hover:underline">Delete All</button>
          </div>
        </div>
        <div className="max-h-[320px] overflow-auto divide-y divide-gray-100 dark:divide-gray-800">
          {items.length === 0 ? (
            <div className="px-4 py-6 text-sm text-gray-500">No notifications</div>
          ) : (
            items.map((n) => (
              <Menu.Item key={n.id}>
                {({ active }) => (
                  <div
                    className={`${active ? "bg-gray-100 dark:bg-gray-700/70 text-gray-800" : "text-gray-700 dark:text-gray-300"} block w-full px-4 py-3 text-sm cursor-pointer`}
                    onClick={() => dispatch(markAsRead(n.id))}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full ${n.read ? "bg-transparent" : "bg-red-500"}`}></div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{n.title}</div>
                        <div className="text-gray-600 dark:text-gray-300">{n.message}</div>
                        <div className="text-xs text-gray-400 mt-1">{timeAgo(n.time)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </Menu.Item>
            ))
          )}
        </div>
        <div className="text-center mb-3 mt-1">
          <span className="text-sm text-indigo-500">Show All</span>
        </div>
      </Dropdown>
    </div>
  );
};

export default Notification;
