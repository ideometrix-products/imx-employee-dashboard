import React, { useState, useEffect, useRef } from "react";
import { Bell, BellDot, User } from "lucide-react";
import logo from "../../assets/imx-logo.jpg";
// import userAvatar from '../../assets/imx-03.jpg';

import AvatarMenu from "../AvatarMenu";
import NotificationDropdown from "./NotificationDropdown";
import { Notification } from "../../types/notification";
import { fetchProfile } from "../Api/PostServices";

const Avatar = ({
  src,
  alt,
  onClick,
}: {
  src: string;
  alt: string;
  onClick: () => void;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <div className="relative cursor-pointer" onClick={onClick}>
      {!imageLoaded && (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="w-6 h-6 text-gray-400" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-10 h-10 rounded-full object-cover border border-gray-300 ${imageLoaded ? '' : 'hidden'}`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageLoaded(false)}
      />
    </div>
  );
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [profile, setProfile] = useState<{ name?: string; imageUrl?: string }>(
    {}
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const avatarSrc = profile.imageUrl || profile.name;

  useEffect(() => {
    fetchProfile()
      .then(setProfile)
      .catch(() => {});
    setNotifications([
      {
        id: 1,
        title: "New Message",
        message: "You have received a new message from Muhammad Iqbal",
        time: "10 min ago",
        isRead: false,
      },
      {
        id: 2,
        title: "System Update",
        message: "System maintenance scheduled for tomorrow",
        time: "2 hours ago",
        isRead: true,
      },
      {
        id: 3,
        title: "New Feature",
        message: "Check out the new dashboard features",
        time: "1 day ago",
        isRead: true,
      },
    ]);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id?: number) => {
    if (id) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } else {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  return (
    <header className="h-20 w-screen px-6 flex items-center justify-between bg-white shadow">
      <div>
        <img src={logo} alt="Company Logo" width={200} />
      </div>
      <div className="flex items-center gap-6">
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              setIsMenuOpen(false);
              if (!isNotificationOpen) markAsRead();
            }}
            className="notificatio-btn p-2 transition-colors relative"
          >
            {unreadCount > 0 ? (
              <BellDot className="h-6 w-6 text-black" />
            ) : (
              <Bell className="h-6 w-6 text-gray" />
            )}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {isNotificationOpen && (
            <NotificationDropdown
              notifications={notifications}
              markAsRead={markAsRead}
            />
          )}
        </div>
        <div className="relative" ref={menuRef}>
          <Avatar
            src={avatarSrc || ''}
            alt={profile.name || 'User Avatar'}
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              setIsNotificationOpen(false);
            }}
          />
          {isMenuOpen && <AvatarMenu onClose={() => setIsMenuOpen(false)} />}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
