'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isPast,
  getDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '@clerk/nextjs';
import useTranslations from '../components/useTranslations';
import { toast } from 'sonner';
import ConfirmationModal from './confirmationModal';

interface Appointment {
  _id: string;
  date: string;
  timeSlot: string;
  userId: string | null;
  isBlocked: boolean;
  professionalId: string;
}

interface CalendarComponentProps {
  language: string;
}

export default function CalendarComponent({ language }: CalendarComponentProps) {
  const t = useTranslations(language);
  const { userId } = useAuth();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedSlotsToEnable, setSelectedSlotsToEnable] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false); // New state for loading


const [showConfirmModal, setShowConfirmModal] = useState(false);
const [confirmModalMessage, setConfirmModalMessage] = useState('');
const [slotToReserve, setSlotToReserve] = useState<string | null>(null); // Para guardar el slot temporalmente


const executeReservation = async () => {
  if (!selectedDay || !slotToReserve) return; // Asegurarse que hay un día y slot seleccionado

  setShowConfirmModal(false); // Oculta la modal

  // Muestra un toast de carga mientras se procesa la solicitud
  const reserveLoadingToastId = toast.loading(t('messages.reserving_slot_loading'));

  try {
    const res = await fetch("/api/appointments/reserve", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: selectedDay.toISOString(),
        timeSlot: slotToReserve,
        language: language,
      }),
    });
    const data = await res.json();

    if (res.ok) {
      toast.success(t('messages.reservation_success'), { id: reserveLoadingToastId });
      const updatedAppointments = await fetch("/api/appointments", { credentials: "include" }).then((r) => r.json());
      setAppointments(Array.isArray(updatedAppointments) ? updatedAppointments : []);
    } else {
      toast.error(t('messages.reservation_error', { error: data.error || 'unknown' }), { id: reserveLoadingToastId });
    }
  } catch (err) {
    console.error("Error in executeReservation:", err);
    toast.error(t('messages.reservation_error', { error: 'Internal server error' }), { id: reserveLoadingToastId });
  } finally {
    setSlotToReserve(null); // Limpia el slot temporal
  }
};

  const dateFnsLocale = useMemo(() => {
    return language === 'es' ? es : enUS;
  }, [language]);

  useEffect(() => {
    const fetchInitialData = async () => {
      // 1. Fetch user role
      if (userId) {
        try {
          const res = await fetch(`/api/role?clerkUserId=${userId}`);
          const data = await res.json();
          // Log para depuración
          console.log("Rol del usuario fetched:", data.role);
          setIsAdmin(data.role === "admin");
        } catch (err) {
          console.error("Error fetching user role:", err);
          toast.error("Error al cargar el rol de usuario.");
        }
      }

      // 2. Fetch all appointments
      try {
        const r = await fetch("/api/appointments", { credentials: "include" });
        const data = await r.json();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Error al cargar los reuniones.");
      }
    };

    fetchInitialData();
  }, [userId]);

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    });
  }, [currentMonth]);

  const firstDayOfMonth = getDay(startOfMonth(currentMonth));
  const startPadding = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1);

  const weekDays = useMemo(() => {
    return [
      t('calendar.monday').substring(0, 3),
      t('calendar.tuesday').substring(0, 3),
      t('calendar.wednesday').substring(0, 3),
      t('calendar.thursday').substring(0, 3),
      t('calendar.friday').substring(0, 3),
      t('calendar.saturday').substring(0, 3),
      t('calendar.sunday').substring(0, 3),
    ];
  }, [language, t]);

  const allPossibleTimeSlots = useMemo(() => {
    const slots = [];
    for (let i = 10; i <= 15; i++) {
      slots.push(`${i}:00 - ${i + 1}:00`);
    }
    return slots;
  }, []);

  const selectedDayAppointments = useMemo(() => {
    if (!selectedDay) return [];
    return appointments.filter(a =>
      format(new Date(a.date), 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd')
    );
  }, [selectedDay, appointments]);

  // Modificación en getSlotStatus
  const getSlotStatus = (timeSlot: string) => {
    const appt = selectedDayAppointments.find(a => a.timeSlot === timeSlot);
    if (!appt) return 'unavailable'; // If no appt exists, it's unavailable (not enabled)
    if (appt.isBlocked) return 'blocked';
    if (appt.userId) return 'reserved'; // This is the key: if userId exists, it's reserved
    return 'available'; // If exists and no userId/not blocked, it's available
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setSelectedSlotsToEnable([]);
  };

  const handleToggleSlotForEnable = (slot: string) => {
    setSelectedSlotsToEnable(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const handleEnableSlots = async () => {
    if (!isAdmin) {
      toast.error(t('messages.not_authorized'));
      return;
    }
    if (!selectedDay || selectedSlotsToEnable.length === 0) {
      toast.error(t('messages.incomplete_data'));
      return;
    }

    setIsLoading(true); // Start loading
    const loadingToastId = toast.loading(t('messages.enabling_slots_loading')); // Show loading toast

    try {
      const res = await fetch("/api/appointments/enable", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDay.toISOString(),
          timeSlots: selectedSlotsToEnable
        }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(t('messages.enable_success'), { id: loadingToastId }); // Update loading toast to success
        // **CRITICAL:** Ensure appointments state is updated with the latest data
        const updatedAppointments = await fetch("/api/appointments", { credentials: "include" }).then((r) => r.json());
        setAppointments(Array.isArray(updatedAppointments) ? updatedAppointments : []); // Ensure it's always an array
        setSelectedSlotsToEnable([]);
      } else {
        toast.error(t('messages.enable_error', { error: data.error || 'unknown' }), { id: loadingToastId }); // Update loading toast to error
      }
    } catch (err) {
      console.error("Error in handleEnableSlots:", err);
      toast.error(t('messages.enable_error', { error: 'Internal server error' }), { id: loadingToastId }); // Update loading toast to error
    } finally {
      setIsLoading(false); // End loading
    }
  };

const handleReserveAppointment = (slotTime: string) => {
  if (!userId) {
    toast.error(t('messages.no_authentication'));
    return;
  }
  if (!selectedDay) {
    toast.error(t('messages.select_date_first'));
    return;
  }

 setConfirmModalMessage(
 
    t('messages.confirm_reservation', {
      date: format(selectedDay, `d MMMM`, { locale: dateFnsLocale }), // This will correctly format as "27 de mayo" or "27 May"
      time: slotTime,
    })
  );
  setSlotToReserve(slotTime); // Guarda el slot
  setShowConfirmModal(true);  // Abre el modal de confirmación
};


  // NUEVA LÓGICA: `visibleTimeSlots` para admin y user normal
  const visibleTimeSlots = useMemo(() => {
    if (isAdmin) {
      return allPossibleTimeSlots; // Admin ve todos los slots posibles
    } else {
      // Usuario normal solo ve slots que están 'available'
      // Esto significa que ya existen en la base de datos y no están reservados/bloqueados
      return selectedDayAppointments
        .filter(appt => !appt.isBlocked && !appt.userId) // Filtra solo los disponibles
        .map(appt => appt.timeSlot);
    }
  }, [isAdmin, allPossibleTimeSlots, selectedDayAppointments]);


  return (
    <div className="flex flex-col md:flex-row gap-8 w-full px-4 md:px-8 py-6 bg-white rounded-2xl shadow-xl border border-gray-100 mx-auto">
      {/* Left Column: Calendar */}
      <div className="flex-1 min-w-[300px] p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <button
            aria-label="Previous month"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-3 rounded-full bg-white text-blue-700 shadow-md hover:bg-gray-100 transition-all duration-200 flex items-center justify-center"
          >
            <FaChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-600">
            {format(currentMonth, "MMMM", { locale: dateFnsLocale })
              .replace(/^\w/, c => c.toUpperCase())}
          </h2>
          <button
            aria-label="Next month"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-3 rounded-full bg-white text-blue-700 shadow-md hover:bg-gray-100 transition-all duration-200 flex items-center justify-center"
          >
            <FaChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-light text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Days of the month grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Padding for days before the 1st of the month */}
          {Array.from({ length: startPadding }).map((_, index) => (
            <div key={`padding-${index}`} className="h-16 w-full"></div>
          ))}

          {/* Modificación en el mapeo de días del calendario */}
          {daysInMonth.map((day) => {
            const hasSlots = appointments.some(
              (a) => format(new Date(a.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
            );
            const isDayToday = isToday(day);
            const isDaySelected = selectedDay && format(day, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd');
            const isPastDay = isPast(day) && !isDayToday; // Correctly determine if a day is in the past, excluding today.


            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                disabled={!isAdmin && (isPastDay || !hasSlots)} // Keep this for non-admins
                className={`flex flex-col items-center justify-center h-16 w-full rounded-lg transition-all duration-200
                  ${isDaySelected
                    ? "bg-blue-600 text-white shadow-lg transform scale-105"
                    : isDayToday
                      ? "bg-blue-200 text-blue-800 font-bold"
                      : hasSlots
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "bg-white text-gray-700 hover:bg-gray-50"}
                  ${(!isAdmin && (isPastDay || !hasSlots)) || (isAdmin && isPastDay) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} // Admin cannot select past days
                  ${isAdmin ? "border border-dashed border-gray-300" : ""}
                `}
              >
                <span className="text-lg font-medium">{format(day, "d")}</span>
                {hasSlots && !isDaySelected && (
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></span>
                )}
                {isDayToday && (
                  <span className="text-[0.6rem] font-semibold text-blue-600">
                    {t('calendar.today')}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Day Details and Time Slots */}
      <div className="flex-1 p-4 bg-gray-50 rounded-xl shadow-lg border border-gray-100">
     <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
  {selectedDay
    ? format(selectedDay, 'PPPP', { locale: dateFnsLocale }).replace(/^\w/, c => c.toUpperCase())
    : t('calendar.select_date')}
</h3>

        <div className="space-y-4">
          {selectedDay ? (
            visibleTimeSlots.length > 0 ? (
              visibleTimeSlots.map((slotTime) => {
                const status = getSlotStatus(slotTime);
                const isSlotPast = isPast(
                  new Date(`${format(selectedDay, 'yyyy-MM-dd')}T${slotTime.split(' - ')[0]}:00`)
                ) && !isToday(selectedDay);

                // Si no es admin y el slot no está disponible (ej: no existe en DB, está bloqueado/reservado), no lo renderices
                if (!isAdmin && (status === 'unavailable' || status === 'blocked' || status === 'reserved' || isSlotPast)) {
                  return null;
                }

                const isBookable = status === 'available' && !isSlotPast;
                const isSelectedForEnable = selectedSlotsToEnable.includes(slotTime);

                return (
                  <div key={slotTime} className={`w-full p-4 rounded-lg text-lg font-semibold shadow-md transition-all duration-200 flex items-center justify-between
                      ${status === 'blocked'
                        ? "bg-red-100 text-red-700 cursor-not-allowed opacity-70"
                        : status === 'reserved' || isSlotPast
                          ? "bg-yellow-100 text-yellow-700 cursor-not-allowed opacity-70"
                          : "bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-lg transform hover:scale-[1.01]"}
                      ${isAdmin && isBookable && 'border-2 border-blue-400'}
                      ${isAdmin && isSelectedForEnable && 'bg-blue-200 !text-blue-800'}
                    `}>
                    <span>{slotTime}</span>

                    {isAdmin ? (
                      <input
                        type="checkbox"
                        checked={isSelectedForEnable}
                        onChange={() => handleToggleSlotForEnable(slotTime)}
                        disabled={
                          status === 'reserved' ||
                          status === 'blocked' ||
                          isSlotPast ||
                          isLoading // Disable checkbox during loading
                        }
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                    ) : (
                      <button
                        onClick={() => handleReserveAppointment(slotTime)}
                        disabled={!isBookable}
                        className={`py-2 px-4 rounded-md text-white font-medium
                          ${isBookable ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}
                        `}
                      >
                        {status === 'blocked'
                          ? t('calendar.blocked')
                          : status === 'reserved'
                            ? t('calendar.reserved')
                            : isSlotPast
                              ? t('calendar.past')
                              : t('calendar.available')}
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 text-lg py-8">
                {isAdmin ? t('calendar.no_slots_to_enable') : t('calendar.no_appointments')}
              </p>
            )
          ) : (
            <p className="text-center text-gray-500 text-lg py-8">
              {t('calendar.select_date')}
            </p>
          )}

        </div>

        

        

        {isAdmin && selectedDay && (
          <button
            onClick={handleEnableSlots}
            disabled={selectedSlotsToEnable.length === 0 || isLoading} // Disable button during loading
            className="mt-6 w-full p-4 rounded-lg text-lg font-medium bg-purple-600 text-white shadow-md hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {t('calendar.enable_slots')}
          </button>
        )}
      </div>
<ConfirmationModal
  show={showConfirmModal}
  message={confirmModalMessage}
  onCancel={() => setShowConfirmModal(false)}
  onConfirm={executeReservation}
  confirmText={t('calendar.confirm_button')}
  cancelText={t('calendar.cancel_button')}
/>
    </div>

    
  );
}