import { ColumnDef } from '@tanstack/react-table';
import { Appointment } from '@/services/appointments/types';
import GoMeetButton from './GoMeetButton';
import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { addDays } from 'date-fns';

const timeZone = 'America/Argentina/Buenos_Aires';


export const columns: ColumnDef<Appointment>[] = [
  {
    accessorKey: "patientId",
    header: "Paciente"
  },
  {
    accessorKey: "date",
    header: "Fecha",
    cell: info => {
      const value = info.getValue() as string;
      const date = value.split('T')[0];
      if (!value) return '-';

      const isoDate = parseISO(date);
      const todayInUTC = formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd');
      const dateInUTC = formatInTimeZone(isoDate, timeZone, 'yyyy-MM-dd');
      const tomorrowInUTC = formatInTimeZone(addDays(new Date(), 1), timeZone, 'yyyy-MM-dd');

      if (dateInUTC === todayInUTC) {
        return 'Hoy';
      }
      if (dateInUTC === tomorrowInUTC) {
        return 'Mañana';
      }

      return formatInTimeZone(
        isoDate,
        'UTC',
        'EEEE d \'de\' MMMM',
        { locale: es }
      );
    },
  },
  {
    accessorKey: "startTime",
    header: "Hora Inicio",
  },
  {
    accessorKey: "meetLink",
    header: "Meet",
    cell: ({ row }) => {
      const meetLink = row.original.meetLink;
      return <GoMeetButton meetLink={meetLink} />;
    },
  }
]