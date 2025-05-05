import { PatientResponse } from "@/services/patient/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Calendar, MapPin, Phone, Mail, Heart } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "../ui/button"

interface PatientInfoProps {
  patient?: PatientResponse;
  meetLink?: string;
}

const convertToISODate = (dateStr: string) => {
  if (!dateStr) return null;

  // Si la fecha incluye hora (formato DD-MM-YYYY HH:mm:ss)
  if (dateStr.includes(' ')) {
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('-');
    return `${year}-${month}-${day}T${timePart}`;
  }

  // Si la fecha está en formato DD-MM-YYYY
  const [day, month, year] = dateStr.split('-');
  return `${year}-${month}-${day}`;
};

export function PatientInfo({ patient, meetLink }: PatientInfoProps) {
  if (!patient) return null;

  const infoItems = [
    {
      icon: <User className="w-4 h-4" />,
      label: "Nombre completo",
      value: `${patient.nombre} ${patient.paterno} ${patient.materno}`
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: "Fecha de nacimiento",
      value: patient.fecha_nacimiento ?
        format(parseISO(convertToISODate(patient.fecha_nacimiento) || ''), "PPP", { locale: es }) :
        "No disponible"
    },
    {
      icon: <MapPin className="w-4 h-4" />,
      label: "Dirección",
      value: patient.direccion
    },
    {
      icon: <Phone className="w-4 h-4" />,
      label: "Teléfono",
      value: patient.celular || patient.telefono_casa || "No registrado"
    },
    {
      icon: <Mail className="w-4 h-4" />,
      label: "Email",
      value: patient.correo
    },
    {
      icon: <Heart className="w-4 h-4" />,
      label: "Previsión",
      value: patient.prevision
    }
  ]

  return (
    <div className="h-full p-4">
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <User className="h-5 w-5 text-tertiary" />
              Información del Paciente
            </CardTitle>
            {meetLink && (
              <Button
                size="sm"
                variant="ghost"
                className="h-12 w-16 p-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50 flex flex-row items-center gap-0.5"
                onClick={() => window.open(meetLink, '_blank')}
              >
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.5 8.5v7a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1z" />
                  <path d="M17.5 9.643v4.714L20 16.5v-9l-2.5 2.143z" />
                </svg>
                <span className="text-md font-medium">Meet</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {infoItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-tertiary/5">
                <div className="text-tertiary">
                  {item.icon}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">
                  {item.label}
                </p>
                <p className="text-sm text-gray-700">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}