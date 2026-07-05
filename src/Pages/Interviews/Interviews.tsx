import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInterviewRequestsEmployee, confirmInterviewRequestEmployee } from "@/components/Api/PostServices";
import {
  Calendar,
  Video,
  CheckCircle,
  ExternalLink,
  Clock,
  Building2,
  Briefcase,
  AlertCircle,
  X,
  User,
  Mail,
  Phone,
  FileText,
  MessageSquare
} from "lucide-react";
import toast from "react-hot-toast";

interface EmployeeInterview {
  _id: string;
  clientName: string;
  clientEmail: string;
  companyName: string;
  phone?: string;
  projectDescription: string;
  preferredDateTime: string;
  zoomLink?: string;
  status: "Proposed" | "Confirmed" | "Completed" | "Cancelled";
  adminNotes?: string;
  createdAt: string;
}

const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return "N/A";
  try {
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return dateTimeStr;
    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch (e) {
    return dateTimeStr;
  }
};

const Interviews = () => {
  const queryClient = useQueryClient();
  const [selectedInterview, setSelectedInterview] = useState<EmployeeInterview | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["interviewRequestsEmployee"],
    queryFn: getInterviewRequestsEmployee,
  });

  const confirmMutation = useMutation({
    mutationFn: confirmInterviewRequestEmployee,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["interviewRequestsEmployee"] });
      toast.success("Availability confirmed successfully", {
        duration: 3000,
        position: "top-right",
      });
      // If the selected modal is active, update the status in local state
      if (selectedInterview && selectedInterview._id === variables) {
        setSelectedInterview(prev => prev ? { ...prev, status: "Confirmed" } : null);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to confirm interview request", {
        duration: 3000,
        position: "top-right",
      });
    },
  });

  const handleConfirm = (id: string) => {
    confirmMutation.mutate(id);
  };

  const requests: EmployeeInterview[] = data?.items || [];

  return (
    <div className="p-4 space-y-6 max-w-8xl mx-auto text-gray-800">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Video className="w-8 h-8 text-[#334557]" />
            My Client Interviews
          </h2>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Review client interview requests, project briefs, and confirm your availability for meetings.
          </p>
        </div>
        <span className="self-start md:self-auto px-4 py-1.5 bg-[#e2e8f0] text-[#334557] rounded-full text-sm font-semibold shadow-sm">
          {requests.length} Total Requests
        </span>
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#334557]"></div>
          <p className="text-gray-500 text-sm">Loading interview requests...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-2xl mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800">Failed to Load Interviews</h3>
          <p className="text-red-600 text-sm mt-1">There was an issue fetching your interview requests. Please refresh the page.</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["interviewRequestsEmployee"] })}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Retry Fetch
          </button>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm max-w-xl mx-auto">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800">No Interview Requests</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
            You don't have any client interviews assigned at the moment. Active requests from clients will show up here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Project Description</th>
                  <th className="px-6 py-4">Preferred Time</th>
                  <th className="px-6 py-4">Meeting Link</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Company */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <span
                          onClick={() => setSelectedInterview(req)}
                          className="font-semibold text-gray-900 cursor-pointer hover:text-[#334557] hover:underline"
                          title="Click to view details"
                        >
                          {req.companyName}
                        </span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4 max-w-sm">
                      <div className="flex items-start gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <p
                          onClick={() => setSelectedInterview(req)}
                          className="text-gray-600 line-clamp-2 cursor-pointer hover:text-gray-900"
                          title="Click to view details"
                        >
                          {req.projectDescription}
                        </p>
                      </div>
                    </td>

                    {/* Time */}
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{formatDateTime(req.preferredDateTime)}</span>
                      </div>
                    </td>

                    {/* Zoom Link */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {req.zoomLink ? (
                        <a
                          href={req.zoomLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#334557] font-semibold hover:underline"
                        >
                          Join Meeting
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Not available yet</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
                        ${req.status === 'Confirmed' ? 'bg-green-50 text-green-700 border border-green-200' : ''}
                        ${req.status === 'Proposed' ? 'bg-blue-50 text-blue-700 border border-blue-200' : ''}
                        ${req.status === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-200' : ''}
                        ${req.status === 'Completed' ? 'bg-gray-100 text-gray-700 border border-gray-200' : ''}
                      `}>
                        {req.status}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => setSelectedInterview(req)}
                        className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        Details
                      </button>
                      {req.status === 'Proposed' ? (
                        <button
                          onClick={() => handleConfirm(req._id)}
                          disabled={confirmMutation.isPending && confirmMutation.variables === req._id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 !bg-[#334557] hover:bg-slate-700 !text-white rounded-lg text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
                        >
                          {confirmMutation.isPending && confirmMutation.variables === req._id ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5" />
                          )}
                          Confirm Available
                        </button>
                      ) : req.status === 'Confirmed' ? (
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium text-xs">
                          <CheckCircle className="w-4 h-4" /> Confirmed
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedInterview && (
        <div
          className="fixed inset-0 z-50 bg-[#1e293b]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedInterview(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-gray-150 transform transition-all duration-300 ease-out scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#334557] px-6 py-5 text-white relative">
              <button
                onClick={() => setSelectedInterview(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-4 h-4" /> Interview Invitation
              </div>
              <h3 className="text-xl font-bold mt-1 text-white pr-8">
                {selectedInterview.companyName}
              </h3>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <User className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">Client Contact</span>
                    <span className="font-semibold text-slate-800 text-sm">{selectedInterview.clientName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">Client Email</span>
                    <a href={`mailto:${selectedInterview.clientEmail}`} className="font-semibold text-sky-600 hover:underline text-sm break-all">
                      {selectedInterview.clientEmail}
                    </a>
                  </div>
                </div>

                {selectedInterview.phone && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                    <div>
                      <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">Phone Number</span>
                      <span className="font-semibold text-slate-800 text-sm">{selectedInterview.phone}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <Clock className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">Scheduled Time</span>
                    <span className="font-semibold text-slate-800 text-sm">
                      {formatDateTime(selectedInterview.preferredDateTime)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and Zoom details */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-slate-100 rounded-xl">
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">Status</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
                    ${selectedInterview.status === 'Confirmed' ? 'bg-green-50 text-green-700 border border-green-200' : ''}
                    ${selectedInterview.status === 'Proposed' ? 'bg-blue-50 text-blue-700 border border-blue-200' : ''}
                    ${selectedInterview.status === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-200' : ''}
                    ${selectedInterview.status === 'Completed' ? 'bg-gray-100 text-gray-700 border border-gray-200' : ''}
                  `}>
                    {selectedInterview.status}
                  </span>
                </div>

                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">Meeting Link</span>
                  {selectedInterview.zoomLink ? (
                    <a
                      href={selectedInterview.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-sm transition-colors border border-emerald-200 shadow-sm"
                    >
                      Join Interview Meeting
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs italic">Not available yet</span>
                  )}
                </div>
              </div>

              {/* Project Brief / Description */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Project Brief & Description
                </h4>
                <div className="bg-slate-55 p-4 rounded-xl border border-slate-100 text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-[#f8fafc]">
                  {selectedInterview.projectDescription}
                </div>
              </div>

              {/* Admin Notes */}
              {selectedInterview.adminNotes && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    Coordinator/Admin Notes
                  </h4>
                  <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-amber-800 text-sm leading-relaxed whitespace-pre-line">
                    {selectedInterview.adminNotes}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedInterview(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                Close
              </button>
              {selectedInterview.status === 'Proposed' && (
                <button
                  onClick={() => handleConfirm(selectedInterview._id)}
                  disabled={confirmMutation.isPending && confirmMutation.variables === selectedInterview._id}
                  className="inline-flex items-center gap-1.5 px-4 py-2 !bg-[#334557] hover:bg-slate-700 !text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {confirmMutation.isPending && confirmMutation.variables === selectedInterview._id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Confirm Available
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interviews;
