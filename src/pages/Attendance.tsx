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

  useEffect(() => {
    api.get<Student[]>("/students").then((res) =>
      setStudents(
        res.data.map((s) => ({
          ...s,
          status: "present"
        }))
      )
    );
  }, []);

  // 🔒 CHECK IF DATE IS LOCKED (OLDER THAN 24 HRS)
  const isLocked = useMemo(() => {
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);

    const now = new Date();
    const diffHours =
      (now.getTime() - selected.getTime()) / (1000 * 60 * 60);

    return diffHours > 24;
  }, [date]);

  const updateStatus = (id: string, status: "present" | "absent") => {
    setStudents((prev) =>
      prev.map((s) => (s._id === id ? { ...s, status } : s))
    );
  };

  const submitAttendance = async () => {
    if (!date) {
      alert("Please select a date");
      return;
    }

    if (isLocked) {
      alert("Attendance is locked for this date 🔒");
      return;
    }

    const records = students.map((s) => ({
      studentId: s._id,
      status: s.status
    }));

    try {
      setLoading(true);

      await api.post("/attendance/mark", { date, records });
      alert("Attendance marked successfully ✅");

    } catch (err: any) {
      const message = err.response?.data?.message;

      if (message === "Attendance already marked for this date") {
        try {
          await api.put("/attendance/edit", { date, records });
          alert("Attendance updated successfully ✏️");
        } catch (editErr: any) {
          alert(editErr.response?.data?.message || "Edit failed");
        }
      } else {
        alert(message || "Failed to submit attendance");
      }
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

        {/* 🔒 LOCK WARNING */}
        {isLocked && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-700 font-semibold">
            🔒 Attendance is locked for this date (older than 24 hours)
          </div>
        )}

        {/* Attendance Table */}
        <div className="bg-white shadow rounded overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-t">
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">
                    <select
                      className="border rounded p-1 disabled:bg-gray-100"
                      value={s.status}
                      disabled={isLocked}
                      onChange={(e) =>
                        updateStatus(
                          s._id,
                          e.target.value as "present" | "absent"
                        )
                      }
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Submit */}
        <button
          onClick={submitAttendance}
          disabled={loading || isLocked}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Attendance"}
        </button>
      </div>
    </Layout>
  );
};

export default Attendance;
