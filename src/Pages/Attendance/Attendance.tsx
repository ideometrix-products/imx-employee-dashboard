import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { StartBreak, endBreak } from "@/components/Api/PostServices"
import { checkIn, checkOut, getAttendanceSummary } from "@/components/Api/PostServices"
import { toast } from "react-toastify"
import { format } from "date-fns"

function formatWorkDuration(hoursFloat: number | string) {
  const hoursNum = typeof hoursFloat === 'string' ? parseFloat(hoursFloat) : hoursFloat;
  if (isNaN(hoursNum)) return 'N/A';
  const totalMinutes = Math.round(hoursNum * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
  if (hours > 0) return `${hours}h`;
  return `${minutes} min`;
}

const Attendance = () => {
  const [today, setToday] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [hasCheckedIn, setHasCheckedIn] = useState(false)
  const [hasCheckedOut, setHasCheckedOut] = useState(false)
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null)
  const [breakEndTime, setBreakEndTime] = useState<Date | null>(null)
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null)
  const [onBreak, setOnBreak] = useState(false)
  const [loading, setLoading] = useState(false)
  const [timelineEvents, setTimelineEvents] = useState<
    Array<{
      type: string
      time: Date
      description: string
    }>
  >([])

  useEffect(() => {
    const now = new Date()
    setToday(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    )
  }, [])

  useEffect(() => {
    const employee = localStorage.getItem("employeeId")
    if (employee) {
      setEmployeeId(employee)
    }
  }, [])

  // Restore timeline from localStorage on mount, per user
  useEffect(() => {
    const employeeId = localStorage.getItem("employeeId");
    if (employeeId) {
      const stored = localStorage.getItem(`timelineEvents_${employeeId}`);
      if (stored) {
        const parsed = JSON.parse(stored).map((event: any) => ({
          ...event,
          time: new Date(event.time),
        }));
        setTimelineEvents(parsed);
      } else {
        setTimelineEvents([]);
      }
    }
  }, []);

  const addTimelineEvent = (type: string, description: string) => {
    const now = new Date();
    const newEvent = { type, time: now, description };
    setTimelineEvents((prev) => {
      const updated = [...prev, newEvent];
      const employeeId = localStorage.getItem("employeeId");
      if (employeeId) {
        localStorage.setItem(`timelineEvents_${employeeId}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const calculateTotalHours = (
    checkInTime: Date | null,
    checkOutTime: Date | null,
    breakStart: Date | null,
    breakEnd: Date | null,
  ) => {
    if (!checkInTime || !checkOutTime) return "N/A"

    const totalMs = checkOutTime.getTime() - checkInTime.getTime()

    let breakMs = 0
    if (breakStart) {
      const breakEndTime = breakEnd || checkOutTime
      breakMs = breakEndTime.getTime() - breakStart.getTime()
    }

    const netWorkingMs = totalMs - breakMs
    const netWorkingHours = netWorkingMs / (1000 * 60 * 60)

    return `${netWorkingHours.toFixed(2)}h`
  }

  const { mutate: handleCheckInOut, isPending: isProcessingCheck } = useMutation({
    mutationFn: async () => {
      if (hasCheckedIn) {
        if (onBreak) {
          await endBreak()
          const endTime = new Date()
          setBreakEndTime(endTime)
          setOnBreak(false)
          addTimelineEvent("break-end", `Break ended at ${formatTime(endTime)}`)
        }
        return checkOut()
      } else {
        return checkIn()
      }
    },
    onSuccess: async (data) => {
      if (hasCheckedIn) {
        const outTime = new Date()
        setCheckOutTime(outTime)
        setHasCheckedIn(false)
        setHasCheckedOut(true)
        localStorage.removeItem("hasCheckedIn")
        addTimelineEvent("checkout", `Checked out at ${formatTime(outTime)}`)
        toast.success("Checked out successfully!")
      } else {
        setHasCheckedIn(true)
        localStorage.setItem("hasCheckedIn", "true")
        addTimelineEvent("checkin", `Checked in at ${formatTime(new Date())}`)
        toast.success("Checked in successfully!")
      }
      // Refetch attendance data to sync with backend
      await refetch()
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.response?.data?.error || error?.message || "Something went wrong!"
      toast.error(message)
    },
  })

  const handleBreakToggle = async () => {
    setLoading(true)
    try {
      if (onBreak) {
        await endBreak()
        const endTime = new Date()
        setBreakEndTime(endTime)
        setOnBreak(false)
        addTimelineEvent("break-end", `Break ended at ${formatTime(endTime)}`)
        toast.success("Break ended successfully!")
      } else {
        await StartBreak()
        const startTime = new Date()
        setBreakStartTime(startTime)
        setOnBreak(true)
        addTimelineEvent("break-start", `Break started at ${formatTime(startTime)}`)
        toast.success("Break started successfully!")
      }
      // Refetch attendance data to sync with backend
      await refetch()
    } catch (error: any) {
      console.error("Break API Error:", error)
      const message = error?.response?.data?.message || "Failed to update break status"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["attendanceSummary", employeeId],
    queryFn: getAttendanceSummary,
    enabled: !!employeeId,
  })

  useEffect(() => {
    if (data?.length > 0) {
      const record = data[0]

      const checkIn = record.checkInTime ? new Date(record.checkInTime) : null
      const checkOut = record.checkOutTime ? new Date(record.checkOutTime) : null
      const breakStart = record.breakStartTime ? new Date(record.breakStartTime) : null
      const breakEnd = record.breakEndTime ? new Date(record.breakEndTime) : null

      setHasCheckedIn(!!checkIn && !checkOut)
      setHasCheckedOut(!!checkOut)
      setBreakStartTime(breakStart)
      setBreakEndTime(breakEnd)
      setOnBreak(!!breakStart && !breakEnd)
      setCheckOutTime(checkOut)
    } else {
      // No record for today, reset all state
      setHasCheckedIn(false)
      setHasCheckedOut(false)
      setOnBreak(false)
      setBreakStartTime(null)
      setBreakEndTime(null)
      setCheckOutTime(null)
    }
  }, [data])


  const attendanceData = useMemo(() => {
    if (data?.length > 0) {
      const record = data[0]
      const breakText = record.breakStartTime
        ? `${format(new Date(record.breakStartTime), "hh:mm a")} - ${record.breakEndTime ? format(new Date(record.breakEndTime), "hh:mm a") : "Ongoing"
        }`
        : breakStartTime
          ? `${format(breakStartTime, "hh:mm a")} - ${breakEndTime ? format(breakEndTime, "hh:mm a") : "Ongoing"}`
          : "N/A"

      return [
        {
          date: format(new Date(record.checkInTime), "dd MMM yyyy"),
          checkIn: record.checkInTime ? format(new Date(record.checkInTime), "hh:mm a") : "N/A",
          breakTime: breakText,
          checkOut: record.checkOutTime
            ? format(new Date(record.checkOutTime), "hh:mm a")
            : checkOutTime
              ? format(checkOutTime, "hh:mm a")
              : "N/A",
          hours: record.totalHoursWorked
            ? formatWorkDuration(record.totalHoursWorked)
            : calculateTotalHours(
              record.checkInTime ? new Date(record.checkInTime) : null,
              record.checkOutTime ? new Date(record.checkOutTime) : checkOutTime,
              record.breakStartTime ? new Date(record.breakStartTime) : breakStartTime,
              record.breakEndTime ? new Date(record.breakEndTime) : breakEndTime,
            ),
          status: "Complete",
        },
      ]
    }

    const breakText = breakStartTime
      ? `${format(breakStartTime, "hh:mm a")} - ${breakEndTime ? format(breakEndTime, "hh:mm a") : "Ongoing"}`
      : "N/A"

    return [
      {
        date: hasCheckedIn ? format(new Date(), "dd MMM yyyy") : "N/A",
        checkIn: hasCheckedIn ? format(new Date(), "hh:mm a") : "N/A",
        breakTime: breakText,
        checkOut: checkOutTime ? format(checkOutTime, "hh:mm a") : "N/A",
        hours: hasCheckedOut
          ? calculateTotalHours(
            hasCheckedIn ? new Date() : null,
            checkOutTime,
            breakStartTime,
            breakEndTime || checkOutTime,
          )
          : "N/A",
        status: hasCheckedOut ? "Complete" : hasCheckedIn ? "In Progress" : "Not Started",
      },
    ]
  }, [data, hasCheckedIn, hasCheckedOut, breakStartTime, breakEndTime, checkOutTime])

  const getStatusBadgeClass = () => {
    if (hasCheckedOut) return "status-checkedout"
    if (onBreak) return "status-break"
    if (hasCheckedIn) return "status-working"
    return ""
  }

  const getStatusText = () => {
    if (hasCheckedOut) return "Checked Out"
    if (onBreak) return "On Break"
    if (hasCheckedIn) return "Working"
    return "-"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Attendance Dashboard</h1>
                <p className="text-slate-300 text-sm">Track your daily work hours and breaks</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-medium">{today}</div>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusBadgeClass()}`}
                >
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                  {getStatusText()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleCheckInOut()}
              className={`group relative px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 ${isProcessingCheck
                ? "bg-slate-400 text-white cursor-not-allowed"
                : hasCheckedIn
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-200 shadow-lg shadow-red-500/25"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 focus:ring-emerald-200 shadow-lg shadow-emerald-500/25"
                }`}
              disabled={isProcessingCheck}
            >
              <div className="flex items-center gap-3">
                {isProcessingCheck ? (
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
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
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={
                        hasCheckedIn
                          ? "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          : "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      }
                    ></path>
                  </svg>
                )}
                <span>{isProcessingCheck ? "Processing..." : hasCheckedIn ? "Check Out" : "Check In"}</span>
              </div>
            </button>

            <button
              onClick={handleBreakToggle}
              disabled={!hasCheckedIn || loading || hasCheckedOut}
              className={`group relative px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 ${!hasCheckedIn || hasCheckedOut
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : onBreak
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 focus:ring-amber-200 shadow-lg shadow-amber-500/25"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:ring-blue-200 shadow-lg shadow-blue-500/25"
                }`}
            >
              <div className="flex items-center gap-3">
                {loading ? (
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
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
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                )}
                <span>{loading ? "Processing..." : onBreak ? "End Break" : "Start Break"}</span>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    ></path>
                  </svg>
                  Today's Attendance
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Check In</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Break Time</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Check Out</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Total Hours</th>

                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((item, index) => (
                      <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-700 font-medium">{item.date}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            {item.checkIn}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{item.breakTime}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {item.checkOut !== "N/A" && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              {item.checkOut}
                            </div>
                          )}
                          {item.checkOut === "N/A" && <span className="text-slate-400">N/A</span>}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-800">{item.hours}</td>
                        {/*  */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {timelineEvents.length > 0 && (
            <div className="xl:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-fit">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    Today's Activity
                  </h3>
                </div>
                <div className="p-6">
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-slate-200"></div>
                    <div className="space-y-6">
                      {timelineEvents.map((event, index) => (
                        <div key={index} className="relative flex items-start gap-4">
                          <div
                            className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ring-4 ring-white shadow-sm ${event.type === "checkin"
                              ? "bg-emerald-500"
                              : event.type === "break-start"
                                ? "bg-amber-500"
                                : event.type === "break-end"
                                  ? "bg-orange-500"
                                  : event.type === "checkout"
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                              }`}
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {event.type === "checkin" && (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                ></path>
                              )}
                              {(event.type === "break-start" || event.type === "break-end") && (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                ></path>
                              )}
                              {event.type === "checkout" && (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                ></path>
                              )}
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-slate-800">
                                {event.description.split(" at ")[0]}
                              </p>
                              <time className="text-xs text-slate-500 font-medium">{formatTime(event.time)}</time>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{event.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
      .status-checkedout {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
      }
      .status-break {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
      }
      .status-working {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
      }
    `}</style>
    </div>
  )
}

export default Attendance
