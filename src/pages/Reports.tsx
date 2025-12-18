import { useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  // 📄 DOWNLOAD PDF
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Daily Attendance Report", 14, 15);

    doc.setFontSize(11);
    doc.text(`Date: ${date}`, 14, 24);

    const tableData = reports.map((r, i) => [
      i + 1,
      r.student.rollNo ?? "-",
      r.student.name,
      r.status.toUpperCase(),
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["#", "Roll No", "Name", "Status"]],
      body: tableData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [37, 99, 235] }, // blue
    });

    doc.save(`daily-attendance-${date}.pdf`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            Daily Attendance Report
          </h2>

          {/* 📥 Download Button */}
          {reports.length > 0 && (
            <button
              onClick={downloadPDF}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Download PDF
            </button>
          )}
        </div>

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
