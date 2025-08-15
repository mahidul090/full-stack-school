import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import AttendanceForm from "@/components/AttendanceForm";

const AttendancePage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // Only allow admin and teacher to access this page
  if (role !== "admin" && role !== "teacher") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Access denied. Only admins and teachers can manage attendance.</p>
      </div>
    );
  }

  const { month, technologyId } = searchParams;
  const selectedMonth = month || new Date().toISOString().slice(0, 7); // YYYY-MM format
  const selectedTechnologyId = technologyId ? parseInt(technologyId) : null;

  // Get all technologies for the dropdown
  const technologies = await prisma.technology.findMany({
    select: {
      id: true,
      name: true,
      semester: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Get students for selected technology
  const students = selectedTechnologyId
    ? await prisma.student.findMany({
        where: {
          technologyId: selectedTechnologyId,
        },
        select: {
          id: true,
          name: true,
          surname: true,
        },
        orderBy: {
          name: "asc",
        },
      })
    : [];

  // Get existing attendance records for the selected month and technology
  const startDate = new Date(selectedMonth + "-01");
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

  const attendanceRecords = selectedTechnologyId
    ? await prisma.attendance.findMany({
        where: {
          studentId: {
            in: students.map((s) => s.id),
          },
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          studentId: true,
          date: true,
          present: true,
        },
      })
    : [];

  // Create attendance map for easy lookup
  const attendanceMap = new Map();
  attendanceRecords.forEach((record) => {
    const key = `${record.studentId}-${record.date.getDate()}`;
    attendanceMap.set(key, record.present);
  });

  // Get number of days in the selected month
  const daysInMonth = endDate.getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Attendance</h1>
      </div>

      {/* FILTERS */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Select Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => {
              const params = new URLSearchParams(window.location.search);
              params.set("month", e.target.value);
              window.location.search = params.toString();
            }}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Select Technology:</label>
          <select
            value={selectedTechnologyId || ""}
            onChange={(e) => {
              const params = new URLSearchParams(window.location.search);
              if (e.target.value) {
                params.set("technologyId", e.target.value);
              } else {
                params.delete("technologyId");
              }
              window.location.search = params.toString();
            }}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="">Select Technology</option>
            {technologies.map((tech) => (
              <option key={tech.id} value={tech.id}>
                {tech.name} ({tech.semester.name})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-1 rounded text-sm hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      {/* ATTENDANCE TABLE */}
      {selectedTechnologyId && students.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Student ID</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                {days.map((day) => (
                  <th key={day} className="border border-gray-300 px-2 py-2 text-center min-w-[40px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{student.id}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.name} {student.surname}
                  </td>
                  {days.map((day) => {
                    const attendanceKey = `${student.id}-${day}`;
                    const isPresent = attendanceMap.get(attendanceKey);
                    return (
                      <td key={day} className="border border-gray-300 px-2 py-2 text-center">
                        <AttendanceForm
                          studentId={student.id}
                          date={new Date(startDate.getFullYear(), startDate.getMonth(), day)}
                          initialValue={isPresent}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {!selectedTechnologyId
            ? "Please select a technology to view attendance"
            : "No students found for the selected technology"}
        </div>
      )}
    </div>
  );
};

export default AttendancePage;