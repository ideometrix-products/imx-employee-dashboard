import { useState, useEffect } from "react"
import {
  Clock,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Timer,
  BarChart3,
  Play,
  Pause,
  Square,
  Coffee,
  Sun,
  Cloud,
  CloudRain,
  Zap,
  Target,
  Award,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getAttendanceSummary } from '@/components/Api/PostServices'

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
}

const productivityTips = [
  "Take a 5-minute break every hour to stay focused",
  "Try the Pomodoro Technique: 25 min work, 5 min break",
  "Stay hydrated - drink water regularly",
  "Good posture improves productivity and health",
  "Natural light helps maintain energy levels",
]

const recentActivities = [
  { time: "2 min ago", action: "Completed task review", type: "success" },
  { time: "15 min ago", action: "Started break", type: "warning" },
  { time: "45 min ago", action: "Checked in", type: "info" },
  { time: "1 hour ago", action: "Updated project status", type: "success" },
]

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedMonth, setSelectedMonth] = useState("")
  const [status, setStatus] = useState<"idle" | "checked-in" | "on-break" | "checked-out">("checked-in")
  const [isBreakActive, setIsBreakActive] = useState(false)
  const [workSeconds, setWorkSeconds] = useState(31523)
  const [breakSeconds, setBreakSeconds] = useState(942)
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [currentTip, setCurrentTip] = useState(0)
  const [weather] = useState({ temp: 72, condition: "sunny" as keyof typeof weatherIcons })
  const [productiveHours, setProductiveHours] = useState<string>('0 min')
  const [breakMinutes, setBreakMinutes] = useState<number>(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!isTimerRunning) return

    const timer = setInterval(() => {
      if (status === "checked-in" && !isBreakActive) {
        setWorkSeconds((prev) => prev + 1)
      } else if (isBreakActive) {
        setBreakSeconds((prev) => prev + 1)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [isTimerRunning, status, isBreakActive])

  useEffect(() => {
    const tipTimer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % productivityTips.length)
    }, 10000)

    return () => clearInterval(tipTimer)
  }, [])

  useEffect(() => {
    // Fetch productive hours and break time from backend
    getAttendanceSummary().then((data) => {
      if (data && data.length > 0) {
        if (data[0].totalHoursWorked !== undefined) {
          setProductiveHours(formatWorkDuration(data[0].totalHoursWorked))
        } else {
          setProductiveHours('0 min')
        }
        // Calculate break time in minutes
        if (data[0].breakStartTime && data[0].breakEndTime) {
          // If only one break for today
          const start = new Date(data[0].breakStartTime).getTime()
          const end = new Date(data[0].breakEndTime).getTime()
          setBreakMinutes(Math.round((end - start) / 60000))
        } else if (data[0].breaks && Array.isArray(data[0].breaks)) {
          // If multiple breaks, sum them
          let total = 0
          for (const br of data[0].breaks) {
            if (br.start && br.end) {
              total += Math.round((new Date(br.end).getTime() - new Date(br.start).getTime()) / 60000)
            }
          }
          setBreakMinutes(total)
        } else {
          setBreakMinutes(0)
        }
      } else {
        setProductiveHours('0 min')
        setBreakMinutes(0)
      }
    }).catch(() => {
      setProductiveHours('0 min')
      setBreakMinutes(0)
    })
  }, [])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatTimeShort = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatCurrentTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatCurrentDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "checked-in":
        return { color: "bg-emerald-500", text: "Active", badge: "default" }
      case "on-break":
        return { color: "bg-amber-500", text: "On Break", badge: "secondary" }
      case "checked-out":
        return { color: "bg-slate-400", text: "Checked Out", badge: "outline" }
      default:
        return { color: "bg-slate-300", text: "Not Checked In", badge: "outline" }
    }
  }

  const statusConfig = getStatusConfig(status)
  const workProgress = Math.min((workSeconds / (8 * 3600)) * 100, 100)
  const breakProgress = Math.min((breakSeconds / (15 * 60)) * 100, 100)
  const WeatherIcon = weatherIcons[weather.condition]

  const handleStartBreak = () => {
    setIsBreakActive(true)
    setStatus("on-break")
  }

  const handleEndBreak = () => {
    setIsBreakActive(false)
    setStatus("checked-in")
  }

  const handleToggleTimer = () => {
    setIsTimerRunning(!isTimerRunning)
  }

  const handleCheckOut = () => {
    setStatus("checked-out")
    setIsTimerRunning(false)
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <div className="flex items-center gap-4 text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <p className="text-sm font-medium">{formatCurrentDate(currentTime)}</p>
              </div>
              <div className="flex items-center gap-2">
                <WeatherIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{weather.temp}°F</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold font-mono">{formatCurrentTime(currentTime)}</div>
                  <div className="text-xs opacity-90">Live Time</div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-3">
              <Badge variant={statusConfig.badge as any} className="px-3 py-1">
                <div className={`w-2 h-2 rounded-full ${statusConfig.color} mr-2 animate-pulse`}></div>
                {statusConfig.text}
              </Badge>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleToggleTimer}
                variant={isTimerRunning ? "default" : "link"}
                className="flex items-center gap-2"
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isTimerRunning ? "Pause" : "Resume"}
              </Button>

              {!isBreakActive ? (
                <Button
                  onClick={handleStartBreak}
                  className="flex items-center gap-2"
                  disabled={status !== "checked-in"}
                >
                  <Coffee className="w-4 h-4" />
                  Start Break
                </Button>
              ) : (
                <Button onClick={handleEndBreak} className="flex items-center gap-2">
                  <Square className="w-4 h-4" />
                  End Break
                </Button>
              )}

              <Button
                onClick={handleCheckOut}
                className="flex items-center gap-2"
                disabled={status === "checked-out"}
              >
                <Square className="w-4 h-4" />
                Check Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <Card className="overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm h-full">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 h-full">
                  <div className="relative">
                    <div className="relative w-48 h-48">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="url(#workGradient)"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={`${(264 * workProgress) / 100} 264`}
                          className="transition-all duration-1000 ease-out"
                        />
                        {isBreakActive && (
                          <circle
                            cx="50"
                            cy="50"
                            r="32"
                            fill="none"
                            stroke="url(#breakGradient)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${(201 * breakProgress) / 100} 201`}
                            className="transition-all duration-1000 ease-out"
                          />
                        )}

                        <defs>
                          <linearGradient id="workGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#1d4ed8" />
                          </linearGradient>
                          <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#d97706" />
                          </linearGradient>
                        </defs>
                      </svg>

                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-slate-900 mb-1 font-mono">{productiveHours}</div>
                          <div className="text-sm text-slate-500 font-medium">Total Time</div>
                          {isBreakActive && (
                            <div className="text-xs text-amber-600 mt-2 font-medium">
                              Break: {formatTime(breakSeconds)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-2xl text-start font-bold text-slate-900 mb-6">Today's Session</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <Clock className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">Work Time</span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">{productiveHours}</div>
                          <div className="text-xs text-slate-500">of 8h target</div>
                          <Progress value={workProgress} className="mt-2 h-2" />
                        </div>

                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-amber-500 rounded-lg">
                              <Timer className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">Break Time</span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">{formatWorkDuration(breakMinutes / 60)}</div>
                          <div className="text-xs text-slate-500">total breaks</div>
                          <Progress value={breakProgress} className="mt-2 h-2" />
                        </div>

                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-500 rounded-lg">
                              <Target className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">Progress</span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">{Math.round(workProgress)}%</div>
                          <div className="text-xs text-slate-500">daily target</div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-500 rounded-lg">
                              <Zap className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">Efficiency</span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">94%</div>
                          <div className="text-xs text-slate-500">productivity score</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Productivity Tip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-emerald-700 leading-relaxed">{productivityTips[currentTip]}</p>
                <div className="flex justify-center mt-3">
                  <div className="flex gap-1">
                    {productivityTips.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${index === currentTip ? "bg-emerald-500" : "bg-emerald-200"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${activity.type === "success"
                          ? "bg-green-500"
                          : activity.type === "warning"
                            ? "bg-amber-500"
                            : "bg-blue-500"
                          }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900 font-medium">{activity.action}</p>
                        <p className="text-xs text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Monthly Attendance Summary
                {selectedMonth && (
                  <Badge variant="outline" className="ml-2">
                    {selectedMonth}
                  </Badge>
                )}
              </CardTitle>

              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full md:w-48 bg-white border-slate-200">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: "Total Present",
                  value: selectedMonth ? "22" : "--",
                  icon: CheckCircle,
                  color: "emerald",
                  gradient: "from-emerald-50 to-green-50",
                  border: "border-emerald-100",
                },
                {
                  label: "Total Absent",
                  value: selectedMonth ? "1" : "--",
                  icon: XCircle,
                  color: "red",
                  gradient: "from-red-50 to-rose-50",
                  border: "border-red-100",
                },
                {
                  label: "Productive Hours",
                  value: selectedMonth ? "176h" : "--",
                  icon: Clock,
                  color: "blue",
                  gradient: "from-blue-50 to-indigo-50",
                  border: "border-blue-100",
                },
                {
                  label: "Avg. Hours/Day",
                  value: selectedMonth ? "8.2h" : "--",
                  icon: TrendingUp,
                  color: "purple",
                  gradient: "from-purple-50 to-violet-50",
                  border: "border-purple-100",
                },
              ].map(({ label, value, icon: Icon, color, gradient, border }) => (
                <div
                  key={label}
                  className={`bg-gradient-to-br ${gradient} p-6 rounded-xl border ${border} hover:shadow-lg transition-all duration-300 group cursor-pointer`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-3 bg-${color}-500 rounded-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h4 className="text-sm font-medium text-slate-600 mb-2">{label}</h4>
                  <p className="text-3xl font-bold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
