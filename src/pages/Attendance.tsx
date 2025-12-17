import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";

interface Student {
  _id: string;
  name: string;
  rollNo?: string;
  status?: "present" | "absent";
}

const Attendance = () => {
  const [students, setStudents] = useState<Student[]>([]);
 const today = new Date().toISOString().split("T")[0];
const [date, setDate] = useState(today);

  useEffect(() => {
    api.get<Student[]>("/students").then((res) =>
      setStudents(
        res.data.map((s) => ({
          ...s,
          status: "present" // default status
        }))
      )
    );
  }, []);

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

    const records = students.map((s) => ({
      studentId: s._id,
      status: s.status
    }));

    await api.post("/attendance/mark", { date, records });
    alert("Attendance marked successfully ✅");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6">
        <h2 className="text-2xl font-bold mb-4">Mark Attendance</h2>

        {/* Date Picker */}
        <div className="mb-6">
          <label className="block mb-1 font-medium">Select Date</label>
          <input
  type="date"
  className="border p-2 rounded"
  value={date}
  onChange={(e) => setDate(e.target.value)}
/>

        </div>

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
                      className="border rounded p-1"
                      value={s.status}
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
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Submit Attendance
        </button>
      </div>
    </Layout>
  );
};

export default Attendance;
