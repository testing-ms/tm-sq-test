export interface AlmaPatient {
  rut: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: string;
  telefono: string;
  email: string;
}

export interface AlmaUser {
  id: number;
  nombre: string;
  rut: string;
  email: string;
  username: string;
}

export interface EditUser {
  consultationDuration?: number;
  externalProfessionalId?: string;
  categoryId?: string;
  calendarVisibility?: boolean;
}

export interface PatientData {
  id: number;
  ss: string;
  nombre: string;
  paterno: string;
  materno: string;
  fecha_nacimiento: string;
  edad: number;
  comuna: string;
  direccion: string;
  correo: string;
  sexo: string;
  prevision: string;
  celular: string;
  telefono_casa: string;
  nacionalidad: string;
  token_app: string;
  occupation: string;
  confirmation: number;
  passport: string | null;
}

export interface Category {
  pc_catid: string;
  pc_catname: string;
  pc_cattype: string;
  pc_active?: number;
  pc_especialidad?: number;
  nombre?: string;
}

export interface AdminUser {
  email: string;
  firstName: string;
  lastName: string;
  externalProfessionalId: string;
  consultationDuration: number;
  picture: string;
  calendarId: string;
  categoryId: string;
  role: string;
  calendarVisibility: boolean;
}

