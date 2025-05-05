import { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FileText, AlertCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MedicalRecordData } from "@/services/alma/MedicalRecord/types";

interface MedicalLicenseProps {
  value?: MedicalRecordData['licenseNumber'];
  onChange: (value: MedicalRecordData['licenseNumber']) => void;
  onValidationChange?: (isValid: boolean) => void;
  required?: boolean;
}

export default function MedicalLicense({ value, onChange, onValidationChange, required = false }: MedicalLicenseProps) {
  const [isChecked, setIsChecked] = useState(!!value);
  const [showPopover, setShowPopover] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateLicense = (checked: boolean, licenseNumber?: string) => {
    if (checked && !licenseNumber) {
      setError('Debes ingresar un número de licencia');
      onValidationChange?.(false);
      return false;
    }
    setError(null);
    onValidationChange?.(true);
    return true;
  };

  const handleCheckboxChange = (checked: boolean) => {
    // Si ya está marcado o hay un valor, no hacemos nada
    if (isChecked || value) return;

    // Solo mostramos el popover si está intentando marcar y no está marcado
    if (checked && !isChecked) {
      setShowPopover(true);
    }
  };

  const handleConfirm = () => {
    setIsChecked(true);
    setShowPopover(false);
    validateLicense(true, value);
  };

  const handleCancel = () => {
    setShowPopover(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    validateLicense(isChecked, newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <FileText className="h-4 w-4 text-tertiary" />
        <p>Licencia Médica {required && <span className="text-red-500">*</span>}</p>
      </div>

      <div className="flex items-center gap-4 pl-2">
        <div className="flex items-center gap-2">
          <Popover open={showPopover && !isChecked} onOpenChange={(open) => !isChecked && setShowPopover(open)}>
            <PopoverTrigger asChild>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="license"
                  checked={isChecked}
                  onCheckedChange={handleCheckboxChange}
                  disabled={isChecked || !!value}
                  className={`${isChecked || value ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-quaternary">
                  <FileText className="h-5 w-5" />
                  <p className="font-medium">Confirmar Licencia Médica</p>
                </div>
                <p className="text-sm text-gray-500">
                  ¿Estás seguro de que deseas generar una licencia médica? Una vez confirmado, deberás ingresar un número de licencia y no podrás deshacer esta acción.
                </p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={handleCancel} className="text-xs">
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleConfirm} className="bg-quaternary hover:bg-quaternary/90 text-xs">
                    Confirmar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <label
            htmlFor="license"
            className={`text-xs font-medium leading-none ${
              isChecked || value ? 'cursor-not-allowed opacity-70' : 'cursor-default'
            }`}
          >
            Agregar licencia médica
          </label>
        </div>

        {isChecked && (
          <div className="flex items-center gap-2 flex-1">
            <Input
              placeholder="Número de licencia"
              className={`h-8 text-sm w-full max-w-xs ${
                error ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-quaternary'
              }`}
              value={value || ''}
              onChange={handleInputChange}
              required
            />
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs whitespace-nowrap">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}