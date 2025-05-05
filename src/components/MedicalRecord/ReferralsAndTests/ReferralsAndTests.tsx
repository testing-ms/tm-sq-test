import { FileText, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { MedicalRecordQueries } from "@/services/alma/MedicalRecord/queries";
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DerivacionDto {
  pc_catid: string;
}

interface ReferralsAndTestsProps {
  value: DerivacionDto[];
  onChange: (value: DerivacionDto[]) => void;
  required?: boolean;
}

export default function ReferralsAndTests({ value = [], onChange, required }: ReferralsAndTestsProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const { data: categories = [], isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: MedicalRecordQueries.getCategories,
  });

  const handleAddReferral = React.useCallback((especialidadId: string | number) => {
    const newDerivacion: DerivacionDto = { pc_catid: String(especialidadId) };
    if (!value.some(v => v.pc_catid === String(especialidadId))) {
      onChange([...value, newDerivacion]);
    }
    setOpen(false);
    setSearchValue("");
  }, [value, onChange]);

  const handleRemoveReferral = React.useCallback((index: number) => {
    onChange(value.filter((_, i) => i !== index));
  }, [value, onChange]);

  const filteredCategories = React.useMemo(() => {
    if (!searchValue.trim()) return categories;
    const searchLower = searchValue.toLowerCase();
    return categories.filter(category =>
      category.pc_catname.toLowerCase().includes(searchLower) ||
      (category.nombre?.toLowerCase() || '').includes(searchLower)
    );
  }, [categories, searchValue]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <FileText className="h-4 w-4 text-tertiary" />
        Derivaciones y Exámenes {required && <span className="text-red-500">*</span>}
      </div>
      <div className="space-y-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-8 text-sm"
              disabled={isLoading}
            >
              <span className="truncate">
                {isLoading ? (
                  "Cargando..."
                ) : isError ? (
                  "Error al cargar categorías"
                ) : (
                  "Seleccione una especialidad o examen"
                )}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" sideOffset={4}>
            <Command className="max-h-[50vh]">
              <CommandInput
                placeholder="Buscar especialidad o examen..."
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandList>
                <CommandEmpty>
                  {isError
                    ? "Error al cargar las categorías"
                    : "No se encontraron resultados."}
                </CommandEmpty>
                <CommandGroup>
                  {filteredCategories.map((category) => (
                    <CommandItem
                      key={category.pc_catid}
                      value={category.pc_catname}
                      onSelect={() => handleAddReferral(category.pc_catid)}
                      className="flex items-center gap-2"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 flex-shrink-0",
                          value.some(v => v.pc_catid === String(category.pc_catid))
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{category.pc_catname}</span>
                        {category.nombre && (
                          <span className="text-xs text-gray-500 truncate">{category.nombre}</span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="space-y-2">
          {value.map((derivacion, index) => {
            const categoria = categories.find(c => String(c.pc_catid) === derivacion.pc_catid);
            if (!categoria) return null;

            return (
              <div key={categoria.pc_catid} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div className="flex flex-col min-w-0 flex-1 mr-2">
                  <span className="text-sm font-medium truncate">{categoria.pc_catname}</span>
                  {categoria.nombre && (
                    <span className="text-xs text-gray-500 truncate">{categoria.nombre}</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveReferral(index)}
                  className="h-6 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                >
                  Eliminar
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}