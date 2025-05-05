export interface PatientFormData {
  rut: string;
  nombres: string;
  paterno: string;
  materno: string;
  email: string;
  numero_contacto: string;
}

export interface PatientResponse {
  nombre: string;
  paterno: string;
  materno: string;
  correo: string;
  celular: string;
  direccion: string;
  fecha_nacimiento: string;
  prevision: string;
  sexo: string;
  telefono_casa: string;
  rut: string;
}