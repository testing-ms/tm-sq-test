import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";
import { MedicalRecordData } from "@/services/alma/MedicalRecord/types";

interface PhysicalExaminationProps {
  value?: MedicalRecordData['examenFisico'];
  onChange: (value: MedicalRecordData['examenFisico']) => void;
  required?: boolean;
}

type ExamenFisicoField = keyof NonNullable<MedicalRecordData['examenFisico']>;

export default function PhysicalExamination({ value, onChange, required }: PhysicalExaminationProps) {
  const handleInputChange = (field: ExamenFisicoField, inputValue: string) => {
    onChange({
      ...value,
      [field]: field === 'pres_arterial' || field === 'temperature' || field === 'ex_fi_seg'
        ? inputValue
        : inputValue === '' ? undefined : inputValue ? Number(inputValue) : undefined
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <FileText className="h-4 w-4 text-tertiary" />
        Examen Físico {required && <span className="text-red-500">*</span>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="weight" className="text-sm text-gray-600">
            Peso (kg)
          </label>
          <Input
            id="weight"
            type="number"
            placeholder="Ej: 70"
            value={value?.weight || ''}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="height" className="text-sm text-gray-600">
            Altura (cm)
          </label>
          <Input
            id="height"
            type="number"
            placeholder="Ej: 170"
            value={value?.height || ''}
            onChange={(e) => handleInputChange('height', e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="bmi" className="text-sm text-gray-600">
            IMC (kg/m²)
          </label>
          <Input
            id="bmi"
            type="number"
            placeholder="Ej: 24.2"
            value={value?.BMI || ''}
            onChange={(e) => handleInputChange('BMI', e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="freq_cardiaca" className="text-sm text-gray-600">
            Frecuencia Cardíaca (lpm)
          </label>
          <Input
            id="freq_cardiaca"
            type="number"
            placeholder="Ej: 80"
            value={value?.freq_cardiaca || ''}
            onChange={(e) => handleInputChange('freq_cardiaca', e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="waist_circ" className="text-sm text-gray-600">
            Circunferencia de Cintura (cm)
          </label>
          <Input
            id="waist_circ"
            type="number"
            placeholder="Ej: 85"
            value={value?.waist_circ || ''}
            onChange={(e) => handleInputChange('waist_circ', e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="pres_arterial" className="text-sm text-gray-600">
            Presión Arterial (mmHg)
          </label>
          <Input
            id="pres_arterial"
            placeholder="Ej: 120/80"
            value={value?.pres_arterial || ''}
            onChange={(e) => handleInputChange('pres_arterial', e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="temperature" className="text-sm text-gray-600">
            Temperatura (°C)
          </label>
          <Input
            id="temperature"
            placeholder="Ej: 36.5"
            value={value?.temperature || ''}
            onChange={(e) => handleInputChange('temperature', e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="ex_fi_seg" className="text-sm text-gray-600">
            Examen Físico Segmentario
          </label>
          <Input
            id="ex_fi_seg"
            placeholder="Ingrese observaciones"
            value={value?.ex_fi_seg || ''}
            onChange={(e) => handleInputChange('ex_fi_seg', e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
}