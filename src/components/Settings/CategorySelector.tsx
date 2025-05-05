import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MedicalRecordQueries } from '@/services/alma/MedicalRecord/queries';
import { Category } from '@/services/alma/MedicalRecord/types';
import { UserQueries } from '@/services/users/queries';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function CategorySelector() {
  const { user, setUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const SPECIALTY_ID_TELEMEDICINA_1 = '12';
  const SPECIALTY_ID_TELEMEDICINA_2 = '5';
  const [combinedCategories, setCombinedCategories] = useState<Category[]>([]);

  const { data: categoriesGeneral, isLoading: isLoadingGeneral } = useQuery({
    queryKey: ['categories', SPECIALTY_ID_TELEMEDICINA_1],
    queryFn: () => MedicalRecordQueries.getCategoriesBySpecialty(SPECIALTY_ID_TELEMEDICINA_1)
  });

  const { data: categoriesNutricion, isLoading: isLoadingNutricion } = useQuery({
    queryKey: ['categories', SPECIALTY_ID_TELEMEDICINA_2],
    queryFn: () => MedicalRecordQueries.getCategoriesBySpecialty(SPECIALTY_ID_TELEMEDICINA_2)
  });

  // Combinar categorías una vez que se cargan
  useEffect(() => {
    if (categoriesGeneral && categoriesNutricion) {
      setCombinedCategories([...categoriesGeneral, ...categoriesNutricion]);
    }
  }, [categoriesGeneral, categoriesNutricion]);

  const selectedCategory = combinedCategories.find(
    category => category.pc_catid == user?.categoryId
  );

  const handleSelectCategory = async (categoryId: string) => {
    if (!user) return;

    try {
      setIsUpdating(true);
      await UserQueries.editUser({ categoryId });

      // Actualizar el usuario localmente
      if (setUser && user) {
        setUser({
          ...user,
          categoryId
        });
      }

      toast.success('Categoría actualizada correctamente');
      setOpen(false);
    } catch (error) {
      console.error('Error al actualizar la categoría:', error);
      toast.error('Error al actualizar la categoría');
    } finally {
      setIsUpdating(false);
    }
  };

  const isLoading = isLoadingGeneral || isLoadingNutricion;

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={isLoading || isUpdating}>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Cargando categorías...
              </span>
            ) : isUpdating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Actualizando...
              </span>
            ) : selectedCategory ? (
              <span>{selectedCategory.pc_catname}</span>
            ) : (
              <span>Selecciona una categoría</span>
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Buscar categoría..." />
            <CommandList>
              <CommandEmpty>No se encontraron categorías</CommandEmpty>
              <CommandGroup>
                {combinedCategories.map((category) => (
                  <CommandItem
                    key={category.pc_catid}
                    value={category.pc_catname}
                    onSelect={() => handleSelectCategory(category.pc_catid)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        category.pc_catid === user?.categoryId ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {category.pc_catname}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}