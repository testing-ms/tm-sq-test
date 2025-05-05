import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PatientQueries } from '@/services/patient/queries';
import { MedicalRecordQueries } from '@/services/alma/MedicalRecord/queries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import {
  User,
  FileText,
  TestTube,
  Image as ImageIcon,
  ArrowLeft,
  FileIcon,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Función auxiliar para convertir el formato de fecha
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

export default function PatientPage() {
  const { patientRut } = useParams();
  const navigate = useNavigate();

  const { data: patientData, isLoading: isLoadingPatient } = useQuery({
    queryKey: ['patient', patientRut],
    queryFn: () => PatientQueries.getPatientData(patientRut || ''),
    enabled: !!patientRut,
  });

  const { data: previousAttentions, isLoading: isLoadingPrevious } = useQuery({
    queryKey: ['previousAttentions', patientRut],
    queryFn: () => MedicalRecordQueries.getPreviousAttentions(patientRut || ''),
    enabled: !!patientRut,
  });

  console.log(previousAttentions);

  const { data: laboratoryExams, isLoading: isLoadingLab } = useQuery({
    queryKey: ['laboratoryExams', patientRut],
    queryFn: () => MedicalRecordQueries.getLaboratoryExams(patientRut || ''),
    enabled: !!patientRut,
  });


  const { data: imagingExams, isLoading: isLoadingImaging } = useQuery({
    queryKey: ['imagingExams', patientRut],
    queryFn: () => MedicalRecordQueries.getImagingExams(patientRut || ''),
    enabled: !!patientRut,
  });


  if (isLoadingPatient || isLoadingPrevious || isLoadingLab || isLoadingImaging) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  const infoItems = [
    {
      icon: <Calendar className="h-4 w-4 text-tertiary" />,
      label: "Fecha de Nacimiento",
      value: patientData?.fecha_nacimiento ?
        format(parseISO(convertToISODate(patientData.fecha_nacimiento) || ''), "d 'de' MMMM 'de' yyyy", { locale: es }) :
        'No disponible'
    },
    {
      icon: <User className="h-4 w-4 text-tertiary" />,
      label: "Género",
      value: patientData?.sexo || 'No especificado'
    },
    {
      icon: <Phone className="h-4 w-4 text-tertiary" />,
      label: "Teléfono",
      value: patientData?.celular || patientData?.telefono_casa || 'No disponible'
    },
    {
      icon: <Mail className="h-4 w-4 text-tertiary" />,
      label: "Email",
      value: patientData?.correo || 'No disponible'
    },
    {
      icon: <MapPin className="h-4 w-4 text-tertiary" />,
      label: "Dirección",
      value: patientData?.direccion || 'No disponible'
    },
    {
      icon: <Heart className="h-4 w-4 text-tertiary" />,
      label: "Previsión",
      value: patientData?.prevision || 'No disponible'
    }
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-6">
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 text-tertiary hover:text-tertiary/90 hover:bg-tertiary/5"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-tertiary/5">
            <User className="h-5 w-5 text-tertiary" />
          </div>
          <div>
            <h1 className="text-lg font-medium text-gray-900">
              {patientData ? `${patientData.nombre} ${patientData.paterno} ${patientData.materno}` : 'Paciente'}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">RUT:</span>
              <Badge variant="outline" className="text-xs border-tertiary text-tertiary">{patientRut}</Badge>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {infoItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-tertiary/5">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-sm text-gray-700">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attentions" className="w-full">
        <TabsList className="w-full max-w-md mx-auto bg-tertiary/5 p-1">
          <TabsTrigger
            value="attentions"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-tertiary"
          >
            <FileText className="h-4 w-4" />
            <span className="text-sm">Atenciones</span>
          </TabsTrigger>
          <TabsTrigger
            value="laboratory"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-tertiary"
          >
            <TestTube className="h-4 w-4" />
            <span className="text-sm">Laboratorio</span>
          </TabsTrigger>
          <TabsTrigger
            value="imaging"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-tertiary"
          >
            <ImageIcon className="h-4 w-4" />
            <span className="text-sm">Imágenes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attentions" className="mt-6">
          <div className="space-y-3">
            {previousAttentions && previousAttentions.length > 0 ? (
              previousAttentions.map((attention, index) => (
                <Card key={index} className="hover:shadow-sm transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-tertiary/5 mt-0.5">
                          <FileText className="h-4 w-4 text-tertiary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {attention.fecha ?
                              format(parseISO(attention.fecha), "d 'de' MMMM 'de' yyyy", { locale: es }) :
                              'Fecha no disponible'
                            }
                          </p>
                          <p className="text-xs text-gray-500">Dr. {attention.profesional}</p>
                          <Badge className="mt-2 text-xs bg-tertiary/5 text-tertiary hover:bg-tertiary/5">
                            {attention.prestacion}
                          </Badge>
                        </div>
                      </div>
                      {attention.reporte && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-tertiary hover:text-tertiary/90 hover:bg-tertiary/5"
                          onClick={() => window.open(attention.reporte, '_blank')}
                        >
                          <FileIcon className="h-4 w-4 mr-2" />
                          <span className="text-xs">Ver reporte</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No hay atenciones previas registradas</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="laboratory" className="mt-6">
          <div className="space-y-3">
            {laboratoryExams && laboratoryExams.length > 0 ? (
              laboratoryExams.map((exam, index) => (
                <Card key={index} className="hover:shadow-sm transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-tertiary/5 mt-0.5">
                          <TestTube className="h-4 w-4 text-tertiary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{exam.prestacion}</p>
                          <p className="text-xs text-gray-500">
                            {exam.fecha ? format(parseISO(convertToISODate(exam.fecha) || ''), "d 'de' MMMM 'de' yyyy", { locale: es }) : 'Fecha no disponible'}
                          </p>
                          <p className="text-xs text-gray-500">Dr. {exam.profesional}</p>
                          <Badge className="mt-2 text-xs bg-tertiary/5 text-tertiary hover:bg-tertiary/5">
                            {exam.tipo}
                          </Badge>
                        </div>
                      </div>
                      {exam.reporte && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-tertiary hover:text-tertiary/90 hover:bg-tertiary/5"
                          onClick={() => window.open(exam.reporte, '_blank')}
                        >
                          <FileIcon className="h-4 w-4 mr-2" />
                          <span className="text-xs">Ver resultados {exam.id_acceso ? `(${exam.id_acceso})` : ''}</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <TestTube className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No hay exámenes de laboratorio registrados</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="imaging" className="mt-6">
          <div className="space-y-3">
            {imagingExams && imagingExams.length > 0 ? (
              imagingExams.map((exam, index) => (
                <Card key={index} className="hover:shadow-sm transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-tertiary/5 mt-0.5">
                          <ImageIcon className="h-4 w-4 text-tertiary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{exam.prestacion}</p>
                          <p className="text-xs text-gray-500">
                            {exam.fecha ? format(parseISO(convertToISODate(exam.fecha) || ''), "d 'de' MMMM 'de' yyyy", { locale: es }) : 'Fecha no disponible'}
                          </p>
                          <p className="text-xs text-gray-500">Dr. {exam.profesional}</p>
                          <Badge className="mt-2 text-xs bg-tertiary/5 text-tertiary hover:bg-tertiary/5">
                            {exam.tipo}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {exam.reporte && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-tertiary hover:text-tertiary/90 hover:bg-tertiary/5"
                            onClick={() => window.open(exam.reporte, '_blank')}
                          >
                            <FileIcon className="h-4 w-4 mr-2" />
                            <span className="text-xs">Ver reporte {exam.id_acceso ? `(${exam.id_acceso})` : ''}</span>
                          </Button>
                        )}
                        {exam.imagenes && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-tertiary hover:text-tertiary/90 hover:bg-tertiary/5"
                            onClick={() => window.open(exam.imagenes, '_blank')}
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            <span className="text-xs">Ver imagen {exam.id_acceso ? `(${exam.id_acceso})` : ''}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No hay exámenes de imagen registrados</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}