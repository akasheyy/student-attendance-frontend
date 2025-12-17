import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";

interface Student {
  _id: string;
  name: string;
  rollNo?: string;
  status?: "present" | "absent";
}

const Attendance = () => {
  const today = new Date().toISOString().split("T")[0];

  const [students, setStudents] = useState<Student[]>([]);
  const [date, setDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // Load students (NO DEFAULT STATUS)
  useEffect(() => {
    api.get<Student[]>("/students").then((res) =>
      setStudents(
        res.data.map((s) => ({
          ...s,
          status: undefined
        }))
      )
    );
  }, []);

  // 🔍 Check if attendance exists for selected date
  useEffect(() => {
    if (!date) return;

    api
      .get(`/attendance/daily?date=${date}`)
      .then((res) => {
        if (res.data.length > 0) {
          setAlreadySubmitted(true);

          setStudents((prev) =>
            prev.map((s) => {
              const found = res.data.find(
                (r: any) => r.student?._id === s._id
              );
              return found
                ? { ...s, status: found.status }
                : s;
            })
          );
        } else {
          setAlreadySubmitted(false);
        }
      })
      .catch(() => setAlreadySubmitted(false));
  }, [date]);

  // 🔒 Check 24-hour lock
  const isLocked = useMemo(() => {
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);

    const now = new Date();
    return (now.getTime() - selected.getTime()) / (1000 * 60 * 60) > 24;
  }, [date]);

  const updateStatus = (id: string, status: "present" | "absent") => {
    setStudents((prev) =>
      prev.map((s) => (s._id === id ? { ...s, status } : s))
    );
  };

  const submitAttendance = async () => {
    if (isLocked) {
      alert("Attendance is locked for this date 🔒");
      return;
    }

    // ❌ Validation: all students must be marked
    const unmarked = students.find((s) => !s.status);
    if (unmarked) {
      alert("Please mark attendance for all students");
      return;
    }

    const records = students.map((s) => ({
      studentId: s._id,
      status: s.status
    }));

    try {
      setLoading(true);

      if (alreadySubmitted) {
        await api.put("/attendance/edit", { date, records });
        alert("Attendance updated successfully ✏️");
      } else {
        await api.post("/attendance/mark", { date, records });
        alert("Attendance submitted successfully ✅");
        setAlreadySubmitted(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6">
        <h2 className="text-2xl font-bold mb-4">Mark Attendance</h2>

        {/* Date Picker */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Date</label>
          <input
            type="date"
            className="border p-2 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Info banners */}
        {alreadySubmitted && !isLocked && (
          <div className="mb-4 p-3 rounded bg-blue-100 text-blue-700 font-medium">
            ℹ️ Attendance already submitted. You can edit within 24 hours.
          </div>
        )}

        {isLocked && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-700 font-semibold">
            🔒 Attendance is locked for this date
          </div>
        )}

        {/* Attendance Table */}
        <div className="bg-white shadow rounded overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-t">
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        disabled={isLocked}
                        onClick={() => updateStatus(s._id, "present")}
                        className={`px-4 py-1 rounded border font-medium ${
                          s.status === "present"
                            ? "bg-green-600 text-white"
                            : "bg-white text-gray-700"
                        } disabled:opacity-50`}
                      >
                        Present
                      </button>

                      <button
                        disabled={isLocked}
                        onClick={() => updateStatus(s._id, "absent")}
                        className={`px-4 py-1 rounded border font-medium ${
                          s.status === "absent"
                            ? "bg-red-600 text-white"
                            : "bg-white text-gray-700"
                        } disabled:opacity-50`}
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

        {/* Submit / Update Button */}
        <button
          onClick={submitAttendance}
          disabled={loading || isLocked}
          className={`mt-6 px-6 py-2 rounded text-white font-semibold ${
            alreadySubmitted
              ? "bg-yellow-600 hover:bg-yellow-700"
              : "bg-blue-600 hover:bg-blue-700"
          } disabled:opacity-50`}
        >
          {loading
            ? "Processing..."
            : alreadySubmitted
            ? "Update Attendance"
            : "Submit Attendance"}
        </button>
      </div>
    </Layout>
  );
};

export default Attendance;
