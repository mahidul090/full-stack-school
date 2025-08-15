"use client";

import { useState } from "react";
import { updateAttendance } from "@/lib/actions";

interface AttendanceFormProps {
  studentId: string;
  date: Date;
  initialValue?: boolean;
}

const AttendanceForm = ({ studentId, date, initialValue }: AttendanceFormProps) => {
  const [isPresent, setIsPresent] = useState<boolean | undefined>(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  const handleAttendanceChange = async (present: boolean) => {
    setIsLoading(true);
    try {
      await updateAttendance(studentId, date, present);
      setIsPresent(present);
    } catch (error) {
      console.error("Failed to update attendance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      {isPresent === undefined ? (
        <div className="flex gap-1">
          <button
            onClick={() => handleAttendanceChange(true)}
            disabled={isLoading}
            className="w-6 h-6 rounded-full border-2 border-green-500 hover:bg-green-500 hover:text-white transition-colors disabled:opacity-50"
            title="Mark Present"
          >
            ✓
          </button>
          <button
            onClick={() => handleAttendanceChange(false)}
            disabled={isLoading}
            className="w-6 h-6 rounded-full border-2 border-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
            title="Mark Absent"
          >
            ✗
          </button>
        </div>
      ) : (
        <button
          onClick={() => handleAttendanceChange(!isPresent)}
          disabled={isLoading}
          className={`w-6 h-6 rounded-full ${
            isPresent
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          } hover:opacity-80 transition-opacity disabled:opacity-50`}
          title={isPresent ? "Present (click to mark absent)" : "Absent (click to mark present)"}
        >
          {isPresent ? "✓" : "✗"}
        </button>
      )}
    </div>
  );
};

export default AttendanceForm;