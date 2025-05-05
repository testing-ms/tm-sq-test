export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  message: string;
  id: number;
  rut_cajero: string;
  email_user: string;
  userGroup: number;
  id_caja: number;
  facility: number;
  token: string;
  token_exp: number;
}

export interface ProfessionalInfo {
  firstName: string;
  lastName: string;
  email: string;
  externalProfessionalId: string;
  consultationDuration: number;  // en minutos
  picture: string;
  calendarId: string;
  accessToken?: string;
  categoryId: string;
  role: string;  // 'admin' | 'professional' | 'user'
  calendarVisibility?: boolean;
}