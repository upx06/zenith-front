import { useState } from "react";
import { User } from "lucide-react";
import type { IStudent } from "../interfaces/IStudent";

interface Teacher {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface ClassroomLayoutProps {
  teacher: Teacher;
  students: IStudent[];
  capacity: number;
}

interface SeatProps {
  student?: IStudent;
  isEmpty: boolean;
  isTeacher?: boolean;
}

const Seat = ({ student, isEmpty, isTeacher = false }: SeatProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`
          w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer
          ${
            isTeacher
              ? "bg-blue-600 hover:bg-blue-700 shadow-md"
              : isEmpty
              ? "bg-slate-200 hover:bg-slate-300 border-2 border-dashed border-slate-400"
              : "bg-green-500 hover:bg-green-600 shadow-sm"
          }
        `}
      >
        <User
          className={`w-5 h-5 ${
            isTeacher ? "text-white" : isEmpty ? "text-slate-400" : "text-white"
          }`}
        />
      </div>

      {showTooltip && !isEmpty && student && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64">
          <div className="bg-slate-800 text-white rounded-lg shadow-xl p-3">
            <div className="text-sm font-semibold mb-1">{student.name}</div>
            <div className="text-xs text-slate-300 space-y-0.5">
              {student.email && (
                <div className="flex items-start gap-1">
                  <span className="font-medium">Email:</span>
                  <span className="break-all">{student.email}</span>
                </div>
              )}
              {student.phone && (
                <div className="flex items-start gap-1">
                  <span className="font-medium">Telefone:</span>
                  <span>{student.phone}</span>
                </div>
              )}
            </div>
            {/* Seta do tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
              <div className="border-4 border-transparent border-t-slate-800" />
            </div>
          </div>
        </div>
      )}

      {showTooltip && isEmpty && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2">
          <div className="bg-slate-800 text-white rounded-lg shadow-xl px-3 py-1.5">
            <div className="text-xs">Lugar vazio</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
              <div className="border-4 border-transparent border-t-slate-800" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TeacherDesk = ({ teacher }: { teacher: Teacher }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="bg-blue-600 hover:bg-blue-700 rounded-lg px-6 py-3 flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-colors">
        <User className="w-5 h-5 text-white" />
        <span className="text-white font-semibold text-sm">Professor(a)</span>
      </div>

      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64">
          <div className="bg-slate-800 text-white rounded-lg shadow-xl p-3">
            <div className="text-sm font-semibold mb-1">{teacher.name}</div>
            <div className="text-xs text-slate-300 space-y-0.5">
              {teacher.email && (
                <div className="flex items-start gap-1">
                  <span className="font-medium">Email:</span>
                  <span className="break-all">{teacher.email}</span>
                </div>
              )}
              {teacher.phone && (
                <div className="flex items-start gap-1">
                  <span className="font-medium">Telefone:</span>
                  <span>{teacher.phone}</span>
                </div>
              )}
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
              <div className="border-4 border-transparent border-t-slate-800" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ClassroomLayout = ({
  teacher,
  students,
  capacity,
}: ClassroomLayoutProps) => {
  const COLUMNS = 5;
  const rows = Math.ceil(capacity / COLUMNS);

  const seats: (IStudent | null)[] = [];
  for (let i = 0; i < capacity; i++) {
    seats.push(students[i] || null);
  }

  return (
    <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
      <div className="space-y-6">
        <div className="flex justify-center pb-4 border-b-2 border-slate-300">
          <TeacherDesk teacher={teacher} />
        </div>

        <div className="space-y-4">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-3">
              {seats
                .slice(rowIndex * COLUMNS, (rowIndex + 1) * COLUMNS)
                .map((student, seatIndex) => (
                  <Seat
                    key={`seat-${rowIndex}-${seatIndex}`}
                    student={student || undefined}
                    isEmpty={!student}
                  />
                ))}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded" />
            <span className="text-xs text-slate-600">Professor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-xs text-slate-600">Ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-200 border-2 border-dashed border-slate-400 rounded" />
            <span className="text-xs text-slate-600">Vazio</span>
          </div>
        </div>

        <div className="flex justify-center gap-4 text-sm text-slate-600">
          <span>
            <strong>{students.length}</strong> alunos presentes
          </span>
          <span className="text-slate-400">•</span>
          <span>
            <strong>{capacity - students.length}</strong> lugares vazios
          </span>
        </div>
      </div>
    </div>
  );
};
