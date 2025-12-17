import { useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";

interface Report {
  _id: string;
  status: "present" | "absent";
  student: {
    name: string;
    rollNo?: string | number;
  };
}

const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const loadDailyReport = async (selectedDate: string) => {
    setDate(selectedDate);

    if (!selectedDate) {
      setReports([]);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get<Report[]>(
        `/attendance/daily?date=${selectedDate}`
      );
      setReports(res.data);
    } catch (err) {
      alert("Failed to load daily report");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6">
        <h2 className="text-2xl font-bold mb-4">
          Daily Attendance Report
        </h2>

        {/* Date Picker */}
        <div className="mb-6">
          <label className="block mb-1 font-medium">
            Select Date
          </label>
          <input
            type="date"
            className="border p-2 rounded"
            value={date}
            onChange={(e) => loadDailyReport(e.target.value)}
          />
        </div>

        {/* Report Table */}
        <div className="bg-white shadow rounded overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Roll No</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {!loading && reports.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="p-4 text-center text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              )}

              {reports.map((r, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">
                    {r.student.rollNo ?? "-"}
                  </td>
                  <td className="p-3">
                    {r.student.name}
                  </td>
                  <td
                    className={`p-3 font-semibold ${
                      r.status === "present"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {r.status.toUpperCase()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <div className="p-4 text-center text-gray-500">
              Loading...
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
