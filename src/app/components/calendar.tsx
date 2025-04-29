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

const CalendarComponent = ({ language }: CalendarComponentProps) => {
  const { user } = useUser();
  const [appointments, setAppointments] = useState<Slot[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAdmin, setIsAdmin] = useState(false);

  // Obtener el rol del usuario desde el backend
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        if (!user) return; // Asegurarse de que el usuario esté autenticado

        const res = await fetch(`/api/role?clerkUserId=${user.id}`);
        const data = await res.json();

        if (data.role === "admin") {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error al obtener el rol del usuario:", error);
      }
    };

    if (user) {
      fetchUserRole();
    }
  }, [user]);

  useEffect(() => {
    console.log("Usuario actual:", user);
    console.log("Rol del usuario:", isAdmin ? "admin" : "no admin");
  }, [isAdmin]);

  // Obtener todas las citas
  useEffect(() => {
    fetch("/api/appointments", { credentials: "include" })
      .then((res) => res.json())
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

      if (data.success) {
        alert(
          language === "ES"
            ? "Turnos habilitados para el día."
            : "Appointments enabled for the day."
        );

        // Refrescar citas
        const updated = await fetch("/api/appointments", {
          credentials: "include",
        }).then((r) => r.json());
        setAppointments(Array.isArray(updated) ? updated : []);
      } else {
        alert(
          data.error ||
            (language === "ES"
              ? "Error habilitando turnos."
              : "Error enabling appointments.")
        );
      }
    } catch (error) {
      console.error("Error habilitando turnos:", error);
      alert(
        language === "ES"
          ? "Error interno del servidor."
          : "Internal server error."
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
    <div className="flex flex-col items-center w-full max-w-4xl p-6 bg-white shadow-lg rounded-2xl">
      <div className="grid grid-cols-7 gap-4 w-full">
        {daysInMonth.map((day) => {
          const dayAppointments = appointments.filter((slot) =>
            isSameDay(new Date(slot.date), day)
          );
          const available = dayAppointments.filter(
            (s) => !s.isBlocked && !s.userId
          );
          const isEnabled = day <= maxDate || isAdmin;

          return (
            <div
              key={day.toISOString()}
              className={`flex flex-col p-2 rounded-lg border ${
                isToday(day) ? "bg-blue-50 border-blue-300" : "bg-gray-50"
              }`}
            >
              <div className="text-center font-medium text-sm mb-2">
                {format(day, "d 'de' MMMM", {
                  locale: language === "ES" ? es : enUS,
                })}
              </div>

              {isEnabled ? (
                dayAppointments.length > 0 ? (
                  available.map((slot) => (
                    <button
                      key={slot._id}
                      disabled={slot.isBlocked || !!slot.userId}
                      onClick={() => {}}
                      className={`w-full mb-1 p-1 rounded-md text-xs font-semibold shadow-sm ${
                        slot.isBlocked
                          ? "bg-red-400 cursor-not-allowed"
                          : slot.userId
                          ? "bg-yellow-400 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600"
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
                    {language === "ES"
                      ? "Habilitar turnos"
                      : "Enable appointments"}
                  </button>
                ) : (
                  <p className="text-center text-gray-400 text-xs">
                    {language === "ES" ? "No hay turnos" : "No appointments"}
                  </p>
                )
              ) : (
                <p className="text-center text-gray-400 text-xs">
                  {language === "ES" ? "No disponible" : "Not available"}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarComponent;
