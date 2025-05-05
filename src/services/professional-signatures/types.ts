export interface ProfessionalSignature {
  url: string;
  fileName: string;
  contentType: string;
  size: number;
}

export interface SecureSignatureUrl {
  url: string;
  expiresAt: number; // timestamp en milisegundos
}

export interface DeleteSignatureResponse {
  message: string;
}

export interface SignatureInfo {
  url: string | null;
}