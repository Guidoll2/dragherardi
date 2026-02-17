"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, X, Loader2 } from "lucide-react";

interface PendingUser {
  _id: string;
  name?: string;
  email?: string;
  image?: string;
  createdAt: string;
}

interface AdminNotificationsProps {
  language: string;
}

export default function AdminNotifications({ language }: AdminNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch pending count on mount
  useEffect(() => {
    fetchPendingUsers();
  }, []);

  // Refresh when opened
  useEffect(() => {
    if (isOpen) {
      fetchPendingUsers();
    }
  }, [isOpen]);

  async function fetchPendingUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setPendingUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching pending users:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(userId: string, action: "approve" | "reject") {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      if (res.ok) {
        setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
      }
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setActionLoading(null);
    }
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  const t = {
    title: language === "ES" ? "Solicitudes pendientes" : "Pending requests",
    approve: language === "ES" ? "Aprobar" : "Approve",
    reject: language === "ES" ? "Rechazar" : "Reject",
    empty: language === "ES" ? "No hay solicitudes pendientes" : "No pending requests",
    loading: language === "ES" ? "Cargando..." : "Loading...",
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {pendingUsers.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px] leading-none">
            {pendingUsers.length > 9 ? "9+" : pendingUsers.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-800">{t.title}</h3>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">{t.loading}</span>
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">
                {t.empty}
              </div>
            ) : (
              pendingUsers.map((user) => (
                <div
                  key={user._id}
                  className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    {user.image ? (
                      <img
                        src={user.image}
                        alt=""
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#5D8D7C]/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-[#5D8D7C]">
                          {(user.name || user.email || "?")[0].toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {user.name || "Sin nombre"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {timeAgo(user.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleAction(user._id, "approve")}
                        disabled={actionLoading === user._id}
                        className="p-1.5 rounded-lg bg-[#5D8D7C]/10 text-[#5D8D7C] hover:bg-[#5D8D7C]/20 transition-colors disabled:opacity-50"
                        title={t.approve}
                      >
                        {actionLoading === user._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleAction(user._id, "reject")}
                        disabled={actionLoading === user._id}
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                        title={t.reject}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
