import { MedicalRecordData } from './types';

export interface FieldConfig {
  required: boolean;
  visible: boolean;
}

export interface MedicalRecordFieldsConfig {
  motivos: FieldConfig;
  anamnesisRemota: FieldConfig;
  anamnesisProxima: FieldConfig;
  examenFisico: FieldConfig;
  diagnostico: FieldConfig;
  recetaMedica: FieldConfig;
  indicaciones: FieldConfig;
  derivaciones: FieldConfig;
  certificado: FieldConfig;
  licenseNumber: FieldConfig;
}

// Configuración por defecto para MEDICINA GENERAL (3783)
const DEFAULT_CONFIG: MedicalRecordFieldsConfig = {
  motivos: { required: true, visible: true },
  anamnesisRemota: { required: true, visible: true },
  anamnesisProxima: { required: true, visible: true },
  examenFisico: { required: true, visible: true },
  diagnostico: { required: true, visible: true },
  recetaMedica: { required: false, visible: true },
  indicaciones: { required: true, visible: true },
  derivaciones: { required: false, visible: true },
  certificado: { required: true, visible: true },
  licenseNumber: { required: false, visible: true }
};

// Configuración para NUTRICIÓN (3789)
const NUTRITION_CONFIG: MedicalRecordFieldsConfig = {
  motivos: { required: true, visible: true },
  anamnesisRemota: { required: true, visible: true },
  anamnesisProxima: { required: true, visible: true },
  examenFisico: { required: false, visible: false }, // Opcional para nutricionistas
  diagnostico: { required: true, visible: true },
  recetaMedica: { required: false, visible: false },
  indicaciones: { required: true, visible: true },
  derivaciones: { required: false, visible: false }, // No visible para nutricionistas
  certificado: { required: false, visible: false },  // No visible para nutricionistas
  licenseNumber: { required: false, visible: false } // No visible para nutricionistas
};

const CATEGORY_CONFIGS: Record<string, MedicalRecordFieldsConfig> = {
  '3783': DEFAULT_CONFIG,
  '3789': NUTRITION_CONFIG,
};

export const getMedicalRecordConfig = (categoryId?: string): MedicalRecordFieldsConfig => {
  if (!categoryId) return DEFAULT_CONFIG;
  return CATEGORY_CONFIGS[categoryId] || DEFAULT_CONFIG;
};

export const isMedicalRecordValid = (
  draft: MedicalRecordData,
  categoryId?: string,
  customValidations: Record<string, boolean> = {}
): boolean => {
  const config = getMedicalRecordConfig(categoryId);

  const fieldValidations: Record<string, boolean> = {
    motivos: !config.motivos.required || (!!draft?.motivos && draft.motivos.trim() !== ''),
    anamnesisRemota: !config.anamnesisRemota.required || (!!draft?.anamnesisRemota && draft.anamnesisRemota.trim() !== ''),
    anamnesisProxima: !config.anamnesisProxima.required || (!!draft?.anamnesisProxima && draft.anamnesisProxima.trim() !== ''),
    diagnostico: !config.diagnostico.required || (!!draft?.diagnostico && draft.diagnostico.trim() !== ''),
    recetaMedica: !config.recetaMedica.required || (!!draft?.recetaMedica && draft.recetaMedica.trim() !== ''),
    indicaciones: !config.indicaciones.required || (!!draft?.indicaciones && draft.indicaciones.trim() !== ''),
    certificado: !config.certificado.required || (!!draft?.certificado && draft.certificado.trim() !== ''),
    licenseNumber: !config.licenseNumber.required || (!!draft?.licenseNumber && draft.licenseNumber.trim() !== '')
  };

  fieldValidations.examenFisico = !config.examenFisico.required || (
    draft?.examenFisico ?
    Object.values(draft.examenFisico).every(value => value !== undefined && value !== null && value !== '') :
    false
  );

  fieldValidations.derivaciones = !config.derivaciones.required || (
    draft?.derivaciones ?
    draft.derivaciones.length > 0 :
    false
  );

  const allValidations = { ...fieldValidations, ...customValidations };

  return Object.values(allValidations).every(isValid => isValid === true);
};