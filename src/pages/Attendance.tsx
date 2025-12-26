import { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Save,  
  UserCheck, 
  Users 
} from "lucide-react";

// 1. Define the Student interface to fix "never" errors
interface Student {
  _id: string;
  name: string;
  rollNo?: string;
  status?: "present" | "absent";
}

const Attendance = () => {
  const today = new Date().toISOString().split("T")[0];
  
  // 2. Apply the interface to useState
  const [students, setStudents] = useState<Student[]>([]);
  const [date, setDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const attendanceLoadedRef = useRef<string | null>(null);

  useEffect(() => {
    api.get("/students").then((res) => setStudents(res.data));
  }, []);

  useEffect(() => {
    if (!date || attendanceLoadedRef.current === date) return;
    api.get(`/attendance/daily?date=${date}`)
      .then((res) => {
        attendanceLoadedRef.current = date;
        if (res.data.length > 0) {
          setAlreadySubmitted(true);
          setStudents((prev) => prev.map((s) => {
            const found = res.data.find((r: any) => r.student?._id === s._id);
            return found ? { ...s, status: found.status } : s;
          }));
        } else {
          setAlreadySubmitted(false);
          setStudents((prev) => prev.map((s) => ({ ...s, status: undefined })));
        }
      })
      .catch(() => setAlreadySubmitted(false));
  }, [date]);

  const isLocked = useMemo(() => {
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);
    return (Date.now() - selected.getTime()) / (1000 * 60 * 60) > 24;
  }, [date]);

  const stats = useMemo(() => ({
    present: students.filter(s => s.status === "present").length,
    absent: students.filter(s => s.status === "absent").length,
    total: students.length
  }), [students]);

  const updateStatus = (id: string, status: "present" | "absent") => {
    if (isLocked) return;
    setStudents((prev) => prev.map((s) => (s._id === id ? { ...s, status } : s)));
  };

  const submitAttendance = async () => {
    if (isLocked) return;
    const unmarked = students.find((s) => !s.status);
    if (unmarked) return alert("Please mark attendance for all students");

    const records = students.map((s) => ({ studentId: s._id, status: s.status }));
    try {
      setLoading(true);
      if (alreadySubmitted) {
        await api.put("/attendance/edit", { date, records });
      } else {
        await api.post("/attendance/mark", { date, records });
        setAlreadySubmitted(true);
      }
      alert("Attendance Saved!");
    } catch (err) {
      alert("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pb-32">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-4 md:p-6 rounded-3xl border border-gray-100 shadow-sm mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <UserCheck className="text-blue-600" size={28} />
              Daily Roll Call
            </h1>
          </div>

          <div className="flex flex-col gap-1">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
              <input
                type="date"
                className="w-full md:w-auto pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl font-semibold text-gray-700 outline-none"
                value={date}
                onChange={(e) => {
                  attendanceLoadedRef.current = null;
                  setDate(e.target.value);
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
          <div className="bg-white p-3 md:p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:gap-4 text-center md:text-left">
            <div className="hidden md:block p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={20}/></div>
            <div>
              <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase">Total</p>
              <p className="text-lg md:text-xl font-bold">{stats.total}</p>
            </div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:gap-4 text-center md:text-left">
            <div className="hidden md:block p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle size={20}/></div>
            <div>
              <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase text-emerald-600">Present</p>
              <p className="text-lg md:text-xl font-bold text-emerald-600">{stats.present}</p>
            </div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:gap-4 text-center md:text-left">
            <div className="hidden md:block p-3 bg-red-50 text-red-600 rounded-xl"><XCircle size={20}/></div>
            <div>
              <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase text-red-600">Absent</p>
              <p className="text-lg md:text-xl font-bold text-red-600">{stats.absent}</p>
            </div>
          </div>
        </div>

        {/* Attendance List */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <tbody className="divide-y divide-gray-50">
                {students.map((s) => (
                  <tr key={s._id} className="group hover:bg-gray-50/50">
                    <td className="px-4 md:px-8 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-sm md:text-lg leading-tight">{s.name}</span>
                        <span className="text-[10px] md:text-xs text-gray-400 font-mono">Roll: #{s.rollNo || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-4">
                      <div className="flex justify-end bg-gray-100 p-1 rounded-xl w-fit ml-auto">
                        <button
                          disabled={isLocked}
                          onClick={() => updateStatus(s._id, "present")}
                          className={`px-3 md:px-6 py-1.5 md:py-2 rounded-lg text-[10px] md:text-sm font-bold transition-all ${
                            s.status === "present"
                              ? "bg-white text-emerald-600 shadow-sm"
                              : "text-gray-400"
                          }`}
                        >
                          Present
                        </button>
                        <button
                          disabled={isLocked}
                          onClick={() => updateStatus(s._id, "absent")}
                          className={`px-3 md:px-6 py-1.5 md:py-2 rounded-lg text-[10px] md:text-sm font-bold transition-all ${
                            s.status === "absent"
                              ? "bg-white text-red-600 shadow-sm"
                              : "text-gray-400"
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fixed Bottom Button Container */}
        <div className="backdrop-blur-lg border-t border-gray-100 z-40 md:static md:bg-transparent md:border-none md:backdrop-blur-none">
          <div className="max-w-5xl mx-auto">
            {!isLocked && (
              <button
                onClick={submitAttendance}
                disabled={loading}
                className={`w-full md:w-auto md:px-10 py-4 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mx-auto ${
                  alreadySubmitted ? "bg-amber-500" : "bg-blue-600"
                }`}
              >
                {loading ? "Saving..." : alreadySubmitted ? <><Save size={20}/> Update Daily Records</> : <><Save size={20}/> Confirm Attendance</>}
              </button>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Attendance;