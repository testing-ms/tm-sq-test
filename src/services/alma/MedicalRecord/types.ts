export interface PreviousAttention {
  fecha: string | null;
  prestacion: string;
  profesional: string;
  reporte: string;
  rut_profesional: string;
}

export interface AttentionList {
  copago_aporte_neto: number | null;
  copago_cliente_neto: number;
  copago_prevision_neto: number;
  especialidad: string;
  fecha: string;
  fecha_nacimiento: string;
  hora: string;
  hora_pago: string;
  id_encuentro: number;
  id_especialidad: number;
  id_event: number;
  id_prestacion: number;
  id_status: string | null;
  idor: string;
  paciente: string;
  pc_apptstatus: string;
  prestacion: string;
  profesional: string;
  rut_paciente: string;
  sobrecupo: number;
  src_orden_medica: string | null;
  sucursal: string;
  total_neto: number;
}

export interface LaboratoryExam {
  fecha: string;
  id_acceso: string;
  prestacion: string;
  profesional: string;
  reporte: string;
  tipo: string;
}

export interface ImagingExam {
  fecha: string;
  id_acceso: string;
  prestacion: string;
  profesional: string;
  reporte: string;
  tipo: string;
  imagenes: string;
}

export interface AnamnesisRemota {
  anamnesis: string;
}


export interface ExamenFisico {
  weight?: number;
  height?: number;
  BMI?: number;
  freq_cardiaca?: number;
  waist_circ?: number;
  pres_arterial?: string;
  temperature?: string;
  ex_fi_seg?: string;
}

export interface Derivacion {
  pc_catid: string;
}

export interface MedicalRecordData {
  motivos?: string;
  anamnesisRemota?: string;
  anamnesisProxima?: string;
  examenFisico?: ExamenFisico;
  diagnostico?: string;
  recetaMedica?: string;
  indicaciones?: string;
  derivaciones?: Derivacion[];
  certificado?: string;
  licenseNumber?: string;
  isDraft?: boolean;
  lastModified?: Date;
  appointmentId: string;
}

export interface MedicalRecordResponse extends MedicalRecordData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  nombre?: string;
  pc_catid: string;
  pc_catname: string;
  pc_cattype: string;
  pc_active?: number;
  pc_seq?: number;
  pc_constant_id?: string;
  pc_value?: string;
  pc_codmaipo?: string;
  pc_duration?: number;
  pc_especialidad?: number;
  pc_focod?: string;
  pc_price?: number;
}