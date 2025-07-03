"use client"

import { useState, useEffect, useMemo } from "react"
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
} from "date-fns"
import { es, enUS } from "date-fns/locale"
import { FaChevronLeft, FaChevronRight, FaClock, FaCalendarCheck } from "react-icons/fa"
import { useAuth } from "@clerk/nextjs"
import useTranslations from "../components/useTranslations"
import { toast } from "sonner"
import ConfirmationModal from "./confirmationModal"

interface Appointment {
  _id: string
  date: string
  timeSlot: string
  userId: string | null
  isBlocked: boolean
  professionalId: string
}

interface CalendarComponentProps {
  language: string
}

export default function CalendarComponent({ language }: CalendarComponentProps) {
  const t = useTranslations(language)
  const { userId } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedSlotsToEnable, setSelectedSlotsToEnable] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmModalMessage, setConfirmModalMessage] = useState("")
  const [slotToReserve, setSlotToReserve] = useState<string | null>(null)

  const executeReservation = async () => {
    if (!selectedDay || !slotToReserve) return

    setShowConfirmModal(false)
    const reserveLoadingToastId = toast.loading(t("messages.reserving_slot_loading"))

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
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(t("messages.reservation_success"), { id: reserveLoadingToastId })
        const updatedAppointments = await fetch("/api/appointments", { credentials: "include" }).then((r) => r.json())
        setAppointments(Array.isArray(updatedAppointments) ? updatedAppointments : [])
      } else {
        toast.error(t("messages.reservation_error", { error: data.error || "unknown" }), { id: reserveLoadingToastId })
      }
    } catch (err) {
      console.error("Error in executeReservation:", err)
      toast.error(t("messages.reservation_error", { error: "Internal server error" }), { id: reserveLoadingToastId })
    } finally {
      setSlotToReserve(null)
    }
  }

  const dateFnsLocale = useMemo(() => {
    return language === "es" ? es : enUS
  }, [language])

  useEffect(() => {
    const fetchInitialData = async () => {
      if (userId) {
        try {
          const res = await fetch(`/api/role?clerkUserId=${userId}`)
          const data = await res.json()
          console.log("Rol del usuario fetched:", data.role)
          setIsAdmin(data.role === "admin")
        } catch (err) {
          console.error("Error fetching user role:", err)
          toast.error("Error al cargar el rol de usuario.")
        }
      }

      try {
        const r = await fetch("/api/appointments", { credentials: "include" })
        const data = await r.json()
        setAppointments(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching appointments:", error)
        toast.error("Error al cargar los reuniones.")
      }
    }

    fetchInitialData()
  }, [userId])

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    })
  }, [currentMonth])

  const firstDayOfMonth = getDay(startOfMonth(currentMonth))
  const startPadding = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const weekDays = useMemo(() => {
    return [
      t("calendar.monday").substring(0, 3),
      t("calendar.tuesday").substring(0, 3),
      t("calendar.wednesday").substring(0, 3),
      t("calendar.thursday").substring(0, 3),
      t("calendar.friday").substring(0, 3),
      t("calendar.saturday").substring(0, 3),
      t("calendar.sunday").substring(0, 3),
    ]
  }, [language, t])

  const allPossibleTimeSlots = useMemo(() => {
    const slots = []
    for (let i = 10; i <= 15; i++) {
      slots.push(`${i}:00 - ${i + 1}:00`)
    }
    return slots
  }, [])

  const selectedDayAppointments = useMemo(() => {
    if (!selectedDay) return []
    return appointments.filter((a) => format(new Date(a.date), "yyyy-MM-dd") === format(selectedDay, "yyyy-MM-dd"))
  }, [selectedDay, appointments])

  const getSlotStatus = (timeSlot: string) => {
    const appt = selectedDayAppointments.find((a) => a.timeSlot === timeSlot)
    if (!appt) return "unavailable"
    if (appt.isBlocked) return "blocked"
    if (appt.userId) return "reserved"
    return "available"
  }

  const handleDayClick = (day: Date) => {
    setSelectedDay(day)
    setSelectedSlotsToEnable([])
  }

  const handleToggleSlotForEnable = (slot: string) => {
    setSelectedSlotsToEnable((prev) => (prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]))
  }

  const handleEnableSlots = async () => {
    if (!isAdmin) {
      toast.error(t("messages.not_authorized"))
      return
    }

    if (!selectedDay || selectedSlotsToEnable.length === 0) {
      toast.error(t("messages.incomplete_data"))
      return
    }

    setIsLoading(true)
    const loadingToastId = toast.loading(t("messages.enabling_slots_loading"))

    try {
      const res = await fetch("/api/appointments/enable", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDay.toISOString(),
          timeSlots: selectedSlotsToEnable,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(t("messages.enable_success"), { id: loadingToastId })
        const updatedAppointments = await fetch("/api/appointments", { credentials: "include" }).then((r) => r.json())
        setAppointments(Array.isArray(updatedAppointments) ? updatedAppointments : [])
        setSelectedSlotsToEnable([])
      } else {
        toast.error(t("messages.enable_error", { error: data.error || "unknown" }), { id: loadingToastId })
      }
    } catch (err) {
      console.error("Error in handleEnableSlots:", err)
      toast.error(t("messages.enable_error", { error: "Internal server error" }), { id: loadingToastId })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReserveAppointment = (slotTime: string) => {
    if (!userId) {
      toast.error(t("messages.no_authentication"))
      return
    }

    if (!selectedDay) {
      toast.error(t("messages.select_date_first"))
      return
    }

    setConfirmModalMessage(
      t("messages.confirm_reservation", {
        date: format(selectedDay, `d MMMM`, { locale: dateFnsLocale }),
        time: slotTime,
      }),
    )
    setSlotToReserve(slotTime)
    setShowConfirmModal(true)
  }

  const visibleTimeSlots = useMemo(() => {
    if (isAdmin) {
      return allPossibleTimeSlots
    } else {
      return selectedDayAppointments.filter((appt) => !appt.isBlocked && !appt.userId).map((appt) => appt.timeSlot)
    }
  }, [isAdmin, allPossibleTimeSlots, selectedDayAppointments])

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Glass container */}
      <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Calendar Section */}
          <div className="flex-1 p-8 border-r border-white/10">
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-8">
              <button
                aria-label="Previous month"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="group p-3 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/20 text-gray-600 shadow-lg hover:bg-white/60 hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-105"
              >
                <FaChevronLeft className="h-5 w-5 group-hover:transform group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-600">
                  {format(currentMonth, "MMMM yyyy", { locale: dateFnsLocale }).replace(/^\w/, (c) => c.toUpperCase())}
                </h2>
              </div>

              <button
                aria-label="Next month"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="group p-3 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/20 text-indigo-700 shadow-lg hover:bg-white/60 hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-105"
              >
                <FaChevronRight className="h-5 w-5 group-hover:transform group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-indigo-700/80 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: startPadding }).map((_, index) => (
                <div key={`padding-${index}`} className="h-14 w-full"></div>
              ))}

              {daysInMonth.map((day) => {
                const hasSlots = appointments.some(
                  (a) => format(new Date(a.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd"),
                )
                const isDayToday = isToday(day)
                const isDaySelected = selectedDay && format(day, "yyyy-MM-dd") === format(selectedDay, "yyyy-MM-dd")
                const isPastDay = isPast(day) && !isDayToday

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDayClick(day)}
                    disabled={!isAdmin && (isPastDay || !hasSlots)}
                    className={`relative flex flex-col items-center justify-center h-14 w-full rounded-xl transition-all duration-300 group
                      ${
                        isDaySelected
                          ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl transform scale-105 border-2 border-white/30"
                          : isDayToday
                            ? "bg-gradient-to-br from-blue-400/60 to-indigo-500/60 text-white font-bold shadow-lg backdrop-blur-sm border border-white/30"
                            : hasSlots
                              ? "bg-white/50 backdrop-blur-sm text-indigo-700 hover:bg-white/70 hover:shadow-lg border border-white/30"
                              : "bg-white/20 backdrop-blur-sm text-gray-600 hover:bg-white/30 border border-white/20"
                      }
                      ${
                        (!isAdmin && (isPastDay || !hasSlots)) || (isAdmin && isPastDay)
                          ? "opacity-40 cursor-not-allowed"
                          : "cursor-pointer hover:transform hover:scale-105"
                      }
                      ${isAdmin ? "ring-1 ring-dashed ring-indigo-300/50" : ""}
                    `}
                  >
                    <span className="text-sm font-semibold">{format(day, "d")}</span>
                    {hasSlots && !isDaySelected && (
                      <div className="absolute bottom-1 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                    )}
                    {isDayToday && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time Slots Section */}
          <div className="flex-1 p-8 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 backdrop-blur-sm">
                  <FaClock className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {selectedDay
                    ? format(selectedDay, "PPPP", { locale: dateFnsLocale }).replace(/^\w/, (c) => c.toUpperCase())
                    : t("calendar.select_date")}
                </h3>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {selectedDay ? (
                visibleTimeSlots.length > 0 ? (
                  visibleTimeSlots.map((slotTime) => {
                    const status = getSlotStatus(slotTime)
                    const isSlotPast =
                      isPast(new Date(`${format(selectedDay, "yyyy-MM-dd")}T${slotTime.split(" - ")[0]}:00`)) &&
                      !isToday(selectedDay)

                    if (
                      !isAdmin &&
                      (status === "unavailable" || status === "blocked" || status === "reserved" || isSlotPast)
                    ) {
                      return null
                    }

                    const isBookable = status === "available" && !isSlotPast
                    const isSelectedForEnable = selectedSlotsToEnable.includes(slotTime)

                    return (
                      <div
                        key={slotTime}
                        className={`group relative overflow-hidden rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:shadow-lg hover:transform hover:scale-[1.02]
                          ${
                            status === "blocked"
                              ? "bg-red-100/60 border-red-200/50 text-red-700"
                              : status === "reserved" || isSlotPast
                                ? "bg-amber-100/60 border-amber-200/50 text-amber-700"
                                : "bg-emerald-100/60 border-emerald-200/50 text-emerald-700 hover:bg-emerald-200/60"
                          }
                          ${isAdmin && isBookable && "ring-2 ring-indigo-400/50"}
                          ${isAdmin && isSelectedForEnable && "bg-indigo-200/60 !text-indigo-800 ring-2 ring-indigo-500/50"}
                        `}
                      >
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-xl backdrop-blur-sm
                              ${
                                status === "blocked"
                                  ? "bg-red-200/50"
                                  : status === "reserved" || isSlotPast
                                    ? "bg-amber-200/50"
                                    : "bg-emerald-200/50"
                              }
                            `}
                            >
                              <FaClock className="h-4 w-4" />
                            </div>
                            <span className="text-lg font-semibold">{slotTime}</span>
                          </div>

                          {isAdmin ? (
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={isSelectedForEnable}
                                onChange={() => handleToggleSlotForEnable(slotTime)}
                                disabled={status === "reserved" || status === "blocked" || isSlotPast || isLoading}
                                className="w-5 h-5 text-indigo-600 bg-white/50 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2 backdrop-blur-sm"
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => handleReserveAppointment(slotTime)}
                              disabled={!isBookable}
                              className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm border
                                ${
                                  isBookable
                                    ? "bg-indigo-500/80 hover:bg-indigo-600/80 text-white border-indigo-400/50 hover:shadow-lg hover:transform hover:scale-105"
                                    : "bg-gray-400/60 text-gray-600 cursor-not-allowed border-gray-300/50"
                                }
                              `}
                            >
                              <div className="flex items-center space-x-2">
                                <FaCalendarCheck className="h-4 w-4" />
                                <span>
                                  {status === "blocked"
                                    ? t("calendar.blocked")
                                    : status === "reserved"
                                      ? t("calendar.reserved")
                                      : isSlotPast
                                        ? t("calendar.past")
                                        : t("calendar.available")}
                                </span>
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/20 inline-block mb-4">
                      <FaClock className="h-8 w-8 text-gray-400 mx-auto" />
                    </div>
                    <p className="text-gray-500 text-lg">
                      {isAdmin ? t("calendar.no_slots_to_enable") : t("calendar.no_appointments")}
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/20 inline-block mb-4">
                    <FaCalendarCheck className="h-8 w-8 text-gray-400 mx-auto" />
                  </div>
                  <p className="text-gray-500 text-lg">{t("calendar.select_date")}</p>
                </div>
              )}
            </div>

            {isAdmin && selectedDay && (
              <button
                onClick={handleEnableSlots}
                disabled={selectedSlotsToEnable.length === 0 || isLoading}
                className="mt-8 w-full p-4 rounded-2xl text-lg font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center backdrop-blur-sm border border-white/20 hover:transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-3">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Procesando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <FaCalendarCheck className="h-5 w-5" />
                    <span>{t("calendar.enable_slots")}</span>
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        show={showConfirmModal}
        message={confirmModalMessage}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={executeReservation}
        confirmText={t("calendar.confirm_button")}
        cancelText={t("calendar.cancel_button")}
      />
    </div>
  )
}
