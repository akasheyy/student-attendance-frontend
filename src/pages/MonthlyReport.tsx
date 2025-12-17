import { useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface MonthlyReport {
  rollNo: number;
  name: string;
  present: number;
  absent: number;
  total: number;
  percentage: number;
}

const MonthlyReport = () => {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [data, setData] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    if (!month || !year) {
      alert("Please select month and year");
      return;
    }

    try {
      setLoading(true);
      const res = await api.get<MonthlyReport[]>(
        `/attendance/monthly?month=${month}&year=${year}`
      );
      setData(res.data);
    } catch (err) {
      alert("Failed to load monthly report");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 PDF DOWNLOAD FUNCTION
  const downloadPDF = () => {
    if (data.length === 0) {
      alert("No data to download");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Monthly Attendance Report", 14, 15);

    doc.setFontSize(11);
    doc.text(`Month: ${month}   Year: ${year}`, 14, 24);

    const tableData = data.map((r) => [
      r.rollNo,
      r.name,
      r.present,
      r.absent,
      r.total,
      `${r.percentage}%`,
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["Roll No", "Name", "Present", "Absent", "Total", "%"]],
      body: tableData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [37, 99, 235] }, // blue
    });

    doc.save(`attendance-${month}-${year}.pdf`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Monthly Attendance Report
        </h2>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <select
            className="border border-gray-300 p-2 rounded text-gray-800 w-full sm:w-auto"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            <option value="">Select Month</option>
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i + 1}>
                {new Date(0, i).toLocaleString("default", {
                  month: "long",
                })}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Year"
            className="border border-gray-300 p-2 rounded text-gray-800 w-full sm:w-32"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />

          <button
            onClick={loadReport}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
          >
            Generate
          </button>

          <button
            onClick={downloadPDF}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto"
          >
            Download PDF
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-[700px] w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left text-gray-700">Roll No</th>
                <th className="p-3 text-left text-gray-700">Name</th>
                <th className="p-3 text-center text-gray-700">Present</th>
                <th className="p-3 text-center text-gray-700">Absent</th>
                <th className="p-3 text-center text-gray-700">Total</th>
                <th className="p-3 text-center text-gray-700">%</th>
              </tr>
            </thead>

            <tbody className="text-gray-800">
              {!loading && data.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    No data available
                  </td>
                </tr>
              )}

              {data.map((r, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-3">{r.rollNo}</td>
                  <td className="p-3">{r.name}</td>
                  <td className="p-3 text-center text-green-600 font-semibold">
                    {r.present}
                  </td>
                  <td className="p-3 text-center text-red-600 font-semibold">
                    {r.absent}
                  </td>
                  <td className="p-3 text-center">{r.total}</td>
                  <td className="p-3 text-center">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold text-sm">
                      {r.percentage}%
                    </span>
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

export default MonthlyReport;
