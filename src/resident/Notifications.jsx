import React, { useMemo, useState } from "react";
import {
  Bell,
  CheckCircle,
  Clock,
  CreditCard,
  FileCheck,
  FileText,
  Info,
  Trash2,
  Check,
  AlertCircle,
} from "lucide-react";

const Notifications = () => {
  // =====================================================
  // TEMPORARY NOTIFICATIONS
  // =====================================================
  // Sa ngayon frontend muna.
  // Ikakabit natin ito sa database pagkatapos.
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "success",
      title: "Certificate Released",
      message:
        "Your Barangay Clearance has been released and is now available in My Certificates.",
      date: "September 14, 2026",
      time: "10:30 AM",
      read: false,
    },
    {
      id: 2,
      type: "payment",
      title: "Payment Required",
      message:
        "Your Certificate of Residency request is ready for payment.",
      date: "September 13, 2026",
      time: "2:15 PM",
      read: false,
    },
    {
      id: 3,
      type: "verified",
      title: "Request Verified",
      message:
        "Your Barangay ID request has been verified by the barangay staff.",
      date: "September 12, 2026",
      time: "9:45 AM",
      read: true,
    },
    {
      id: 4,
      type: "pending",
      title: "Request Received",
      message:
        "Your Certificate of Indigency request has been received and is currently pending.",
      date: "September 11, 2026",
      time: "4:20 PM",
      read: true,
    },
    {
      id: 5,
      type: "info",
      title: "Welcome to Resident Portal",
      message:
        "Welcome! You can use this portal to manage your profile and monitor your certificate requests.",
      date: "September 10, 2026",
      time: "8:00 AM",
      read: true,
    },
  ]);

  const [filter, setFilter] = useState("All");

  // =====================================================
  // UNREAD COUNT
  // =====================================================
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // =====================================================
  // FILTERED NOTIFICATIONS
  // =====================================================
  const filteredNotifications = useMemo(() => {
    if (filter === "Unread") {
      return notifications.filter(
        (notification) => !notification.read
      );
    }

    if (filter === "Read") {
      return notifications.filter(
        (notification) => notification.read
      );
    }

    return notifications;
  }, [notifications, filter]);

  // =====================================================
  // GET ICON
  // =====================================================
  const getIcon = (type) => {
    switch (type) {
      case "success":
        return (
          <FileCheck className="w-5 h-5 text-green-600" />
        );

      case "payment":
        return (
          <CreditCard className="w-5 h-5 text-orange-600" />
        );

      case "verified":
        return (
          <CheckCircle className="w-5 h-5 text-blue-600" />
        );

      case "pending":
        return (
          <Clock className="w-5 h-5 text-yellow-600" />
        );

      case "warning":
        return (
          <AlertCircle className="w-5 h-5 text-red-600" />
        );

      default:
        return (
          <Info className="w-5 h-5 text-slate-600" />
        );
    }
  };

  // =====================================================
  // GET ICON BACKGROUND
  // =====================================================
  const getIconBackground = (type) => {
    switch (type) {
      case "success":
        return "bg-green-100";

      case "payment":
        return "bg-orange-100";

      case "verified":
        return "bg-blue-100";

      case "pending":
        return "bg-yellow-100";

      case "warning":
        return "bg-red-100";

      default:
        return "bg-slate-100";
    }
  };

  // =====================================================
  // MARK AS READ
  // =====================================================
  const markAsRead = (id) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );
  };

  // =====================================================
  // MARK ALL AS READ
  // =====================================================
  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  // =====================================================
  // DELETE NOTIFICATION
  // =====================================================
  const deleteNotification = (id) => {
    setNotifications((previous) =>
      previous.filter(
        (notification) => notification.id !== id
      )
    );
  };

  // =====================================================
  // CLEAR READ
  // =====================================================
  const clearReadNotifications = () => {
    setNotifications((previous) =>
      previous.filter(
        (notification) => !notification.read
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">

      {/* =================================================
          HEADER
      ================================================= */}
      <div className="max-w-5xl mx-auto mb-6">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>

              <div>

                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                  Notifications
                </h1>

                <p className="text-sm text-slate-500 mt-1">
                  Stay updated with your account and requests.
                </p>

              </div>

            </div>

          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          )}

        </div>

      </div>

      <div className="max-w-5xl mx-auto">

        {/* =================================================
            SUMMARY
        ================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          {/* TOTAL */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs text-slate-500">
                  Total Notifications
                </p>

                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {notifications.length}
                </p>

              </div>

              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">

                <Bell className="w-5 h-5 text-blue-600" />

              </div>

            </div>

          </div>

          {/* UNREAD */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs text-slate-500">
                  Unread
                </p>

                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {unreadCount}
                </p>

              </div>

              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">

                <Info className="w-5 h-5 text-blue-600" />

              </div>

            </div>

          </div>

          {/* READ */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs text-slate-500">
                  Read
                </p>

                <p className="text-2xl font-bold text-green-600 mt-1">
                  {notifications.length -
                    unreadCount}
                </p>

              </div>

              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">

                <CheckCircle className="w-5 h-5 text-green-600" />

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            FILTER BAR
        ================================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div className="flex items-center gap-2">

              <button
                onClick={() => setFilter("All")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  filter === "All"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All
              </button>

              <button
                onClick={() => setFilter("Unread")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  filter === "Unread"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="ml-1.5">
                    ({unreadCount})
                  </span>
                )}
              </button>

              <button
                onClick={() => setFilter("Read")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  filter === "Read"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Read
              </button>

            </div>

            {notifications.some(
              (notification) => notification.read
            ) && (
              <button
                onClick={clearReadNotifications}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition"
              >
                <Trash2 className="w-4 h-4" />
                Clear read
              </button>
            )}

          </div>

        </div>

        {/* =================================================
            NOTIFICATION LIST
        ================================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-200">

            <h2 className="font-bold text-slate-800">
              Your Notifications
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              {filteredNotifications.length} notification
              {filteredNotifications.length !== 1
                ? "s"
                : ""}
            </p>

          </div>

          {filteredNotifications.length === 0 ? (

            /* =================================================
               EMPTY
            ================================================= */

            <div className="p-12 text-center">

              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">

                <Bell className="w-8 h-8 text-slate-400" />

              </div>

              <h3 className="font-semibold text-slate-700">
                No notifications
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                You're all caught up!
              </p>

            </div>

          ) : (

            <div className="divide-y divide-slate-100">

              {filteredNotifications.map(
                (notification) => (

                  <div
                    key={notification.id}
                    className={`p-5 md:px-6 transition ${
                      !notification.read
                        ? "bg-blue-50/40"
                        : "hover:bg-slate-50"
                    }`}
                  >

                    <div className="flex items-start gap-4">

                      {/* ICON */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${getIconBackground(
                          notification.type
                        )}`}
                      >
                        {getIcon(
                          notification.type
                        )}
                      </div>

                      {/* CONTENT */}
                      <div className="flex-1 min-w-0">

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                          <div className="flex items-center gap-2">

                            <h3
                              className={`text-sm ${
                                !notification.read
                                  ? "font-bold text-slate-800"
                                  : "font-semibold text-slate-700"
                              }`}
                            >
                              {notification.title}
                            </h3>

                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            )}

                          </div>

                          <span className="text-xs text-slate-400 shrink-0">
                            {notification.date} •{" "}
                            {notification.time}
                          </span>

                        </div>

                        <p className="text-sm text-slate-500 leading-relaxed mt-2">
                          {notification.message}
                        </p>

                        {/* ACTIONS */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">

                          {!notification.read && (
                            <button
                              onClick={() =>
                                markAsRead(
                                  notification.id
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 rounded-lg transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Mark as read
                            </button>
                          )}

                          <button
                            onClick={() =>
                              deleteNotification(
                                notification.id
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>

                        </div>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default Notifications;