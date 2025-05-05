import { Category, MedicalRecordData } from "@/services/alma/MedicalRecord/types";
import { PatientResponse } from "@/services/patient/types";
import { ProfessionalInfo } from "@/services/Session/types";
import { ProfessionalSignaturesService } from "@/services/professional-signatures/queries";

export interface DocumentData {
  appointmentId: string;
  patientEmail: string;
  patientName: string;
  patientData: {
    name: string;
    rut: string;
    sex: string;
    birthDate: string;
    age: string;
    commune: string;
    address: string;
  };
  appointmentData: {
    prevision: string;
    attentionType: string;
    provider: string;
    providerRut: string;
    date: string;
    signatureUrl: string;
  };
  clinicalData: {
    motives: string;
    remoteAnamnesis: string;
    proximateAnamnesis: string;
    physicalExam: {
      weight: string;
      height: string;
      imc: string;
      heartRate: string;
      waistCircumference: string;
      bloodPressure: string;
      temperature: string;
      segmentaryExam: string;
    };
  };
  prescriptionData: {
    diagnosis: string;
    medications: string;
  };
  examData: {
    diagnosis: string;
    examRequests: string[];
  };
  indicationsData: {
    diagnosis: string;
    indications: string;
  };
}

export async function transformToDocumentData(
  appointmentId: string,
  patientData: PatientResponse,
  draft: MedicalRecordData | null,
  user: ProfessionalInfo | null,
  categories?: Category[]
): Promise<DocumentData> {

  let signatureUrl = '';
  try {
    const { url } = await ProfessionalSignaturesService.getSecureSignatureUrl();
    signatureUrl = url;
  } catch (error) {
    console.error('Error al obtener la firma:', error);
  }

  return {
    appointmentId,
    patientEmail: patientData.correo,
    patientName: `${patientData.nombre} ${patientData.paterno}`,
    patientData: {
      name: `${patientData.nombre} ${patientData.paterno} ${patientData.materno}`.trim(),
      rut: patientData.rut,
      sex: patientData.sexo || '',
      birthDate: patientData.fecha_nacimiento || '',
      age: '',
      commune: '',
      address: patientData.direccion || ''
    },
    appointmentData: {
      prevision: patientData.prevision || '',
      attentionType: 'Teleconsulta',
      provider: user ? `${user.firstName} ${user.lastName}` : '',
      providerRut: '',
      date: new Date().toISOString().split('T')[0],
      signatureUrl
    },
    clinicalData: {
      motives: draft?.motivos || '',
      remoteAnamnesis: draft?.anamnesisRemota || '',
      proximateAnamnesis: draft?.anamnesisProxima || '',
      physicalExam: {
        weight: draft?.examenFisico?.weight?.toString() || '',
        height: draft?.examenFisico?.height?.toString() || '',
        imc: draft?.examenFisico?.BMI?.toString() || '',
        heartRate: draft?.examenFisico?.freq_cardiaca?.toString() || '',
        waistCircumference: draft?.examenFisico?.waist_circ?.toString() || '',
        bloodPressure: draft?.examenFisico?.pres_arterial || '',
        temperature: draft?.examenFisico?.temperature || '',
        segmentaryExam: draft?.examenFisico?.ex_fi_seg || ''
      }
    },
    prescriptionData: {
      diagnosis: draft?.diagnostico || '',
      medications: draft?.recetaMedica || ''
    },
    examData: {
      diagnosis: draft?.diagnostico || '',
      examRequests: draft?.derivaciones?.map(d => {
        const category = categories?.find(c => c.pc_catid == d.pc_catid);
        return category ? `${category.pc_catname}${category.nombre ? ` - ${category.nombre}` : ''}` : d.pc_catid;
      }) || []
    },
    indicationsData: {
      diagnosis: draft?.diagnostico || '',
      indications: draft?.indicaciones || ''
    }
  };
}