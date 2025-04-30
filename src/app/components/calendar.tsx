"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
} from "date-fns";
import { es, enUS } from "date-fns/locale";

interface Slot {
  _id: string;
  date: string;
  timeSlot: string;
  isBlocked: boolean;
  userId?: string;
}

interface CalendarComponentProps {
  language: string;
}

export default function CalendarComponent({
  language,
}: CalendarComponentProps) {
  const { user } = useUser();
  const [appointments, setAppointments] = useState<Slot[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/role?clerkUserId=${user.id}`);
        const data = await res.json();
        setIsAdmin(data.role === "admin");
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserRole();
  }, [user]);

  useEffect(() => {
    fetch("/api/appointments", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setAppointments(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const handleEnableDay = async (day: Date) => {
    if (!isAdmin) return;
    const timeSlots = [
      "10:00 - 11:00",
      "11:00 - 12:00",
      "12:00 - 13:00",
      "13:00 - 14:00",
      "14:00 - 15:00",
      "15:00 - 16:00",
    ];
    try {
      const res = await fetch("/api/appointments/enable", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: day.toISOString(), timeSlots }),
      });
      const data = await res.json();
      alert(
        data.success
          ? language === "ES"
            ? "Turnos habilitados para el día"
            : "Appointments enabled"
          : data.error ||
              (language === "ES"
                ? "Error habilitando turnos"
                : "Error enabling appointments")
      );
      const updated = await fetch("/api/appointments", {
        credentials: "include",
      }).then((r) => r.json());
      setAppointments(Array.isArray(updated) ? updated : []);
    } catch (err) {
      console.error(err);
      alert(
        language === "ES"
          ? "Error interno del servidor"
          : "Internal server error"
      );
    }
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 1);
  maxDate.setDate(15);

  return (
    <div className="w-full max-w-5xl p-4 sm:p-6 bg-white rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <button
          aria-label="Previous month"
          onClick={() =>
            setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1))
          }
          className="p-2 rounded-full hover:bg-pink-100"
        >
          ‹
        </button>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
          {format(currentMonth, "MMMM yyyy", {
            locale: language === "ES" ? es : enUS,
          })}
        </h2>
        <button
          aria-label="Next month"
          onClick={() =>
            setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1))
          }
          className="p-2 rounded-full hover:bg-pink-100"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-3 sm:gap-1">
        {daysInMonth.map((day) => {
          const slots = appointments.filter((a) =>
            isSameDay(new Date(a.date), day)
          );
          const available = slots.filter((s) => !s.isBlocked && !s.userId);
          const isEnabled = day <= maxDate || isAdmin;
          return (
            <div
              key={day.toISOString()}
              className={`flex flex-col md:p-2 rounded-lg border transition-colors duration-200
                ${
                  isToday(day)
                    ? "bg-blue-50 border-blue-200"
                    : "bg-pink-50 border-pink-100"
                }`}
            >
              <div className="text-center text-sm font-medium text-gray-600 mb-2">
                <span className="hidden sm:inline">
                  {format(day, "d 'de' MMMM", {
                    locale: language === "ES" ? es : enUS,
                  })}
                </span>
                <span className="inline sm:hidden">{format(day, "d/M")}</span>
              </div>

              {isEnabled ? (
                slots.length ? (
                  available.map((slot) => (
                    <button
                      key={slot._id}
                      disabled={slot.isBlocked || !!slot.userId}
                      className={`mb-1 w-full p-1 rounded-md text-xs font-semibold shadow-sm transition
                        ${
                          slot.isBlocked
                            ? "bg-red-200 text-red-800 cursor-not-allowed"
                            : slot.userId
                            ? "bg-yellow-200 text-yellow-800 cursor-not-allowed"
                            : "bg-green-200 text-green-800 hover:bg-green-300"
                        }`}
                    >
                      {slot.timeSlot}
                    </button>
                  ))
                ) : isAdmin ? (
                  <button
                    onClick={() => handleEnableDay(day)}
                    className="w-full p-1 rounded-md text-xs font-medium bg-gray-200 hover:bg-gray-300"
                  >
                    <span className="hidden sm:inline">
                      {language === "ES"
                        ? "Habilitar turnos"
                        : "Enable appointments"}
                    </span>
                    <span className="inline sm:hidden">
                      {language === "ES" ? "H. Tur" : "E. App"}
                    </span>
                  </button>
                ) : (
                  <p className="text-center text-xs text-gray-400">
                    {language === "ES" ? "No hay turnos" : "No appointments"}
                  </p>
                )
              ) : (
                <p className="text-center text-xs text-gray-400">
                  {language === "ES" ? "No disponible" : "Not available"}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
