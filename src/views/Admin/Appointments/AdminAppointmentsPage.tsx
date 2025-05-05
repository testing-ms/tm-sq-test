import { useQuery } from "@tanstack/react-query";
import { AppointmentsService } from "@/services/appointments/queries";
import { AdminAppointment, columns } from "./columns";
import { CompactSearchTable } from "@/components/SearchTable/CompactSearchTable";
import { useMemo } from "react";
import { AppointmentStatus } from "@/services/appointments/types";
import { CalendarDays } from "lucide-react";

// Interfaz para los datos que vienen del backend
interface ApiAppointment {
  id: number;
  patientId: string;
  patientName: string;
  date: string | Date;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string;
  meetLink: string;
  externalAppointmentId: string;
  professional: {
    id: string;
    name: string;
    email: string;
  }
}

export default function AdminAppointmentsPage() {
  const { data: appointmentsData, isLoading } = useQuery<ApiAppointment[]>({
    queryKey: ['admin-appointments'],
    queryFn: () => AppointmentsService.getAllAppointmentsForAdmin() as unknown as Promise<ApiAppointment[]>,
  });


  const appointments = useMemo(() => {
    if (!appointmentsData) return [];

    // Transformar los datos al formato esperado por la tabla
    return appointmentsData.map((appointment): AdminAppointment => ({
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      date: appointment.date.toString(),
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      notes: appointment.notes,
      meetLink: appointment.meetLink,
      externalAppointmentId: appointment.externalAppointmentId,
      professionalName: appointment.professional.name,
      professionalEmail: appointment.professional.email
    }));
  }, [appointmentsData]);

  return (
    <div className="container mx-auto py-4">
      <div className="flex flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-tertiary" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-medium">Administración de Citas</h1>
          <p className="text-sm text-gray-500">Vista general de todas las citas de los profesionales</p>
        </div>
      </div>

      <div className="space-y-6 bg-white py-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="loader"></div>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <CompactSearchTable
                columns={columns}
                data={appointments}
                tableSize={20}
                className="h-[calc(100vh-280px)]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}