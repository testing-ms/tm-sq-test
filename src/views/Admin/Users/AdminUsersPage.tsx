import { useQuery } from "@tanstack/react-query";
import { UserQueries } from "@/services/users/queries";
import { AdminUser, Category } from "@/services/users/types";
import { columns, EditableColumnContext } from "./columns";
import { CompactSearchTable } from "@/components/SearchTable/CompactSearchTable";
import { useMemo, useEffect, useState } from "react";
import { Users } from "lucide-react";
import { ProfessionalInfo } from "@/services/Session/types";
import { MedicalRecordQueries } from "@/services/alma/MedicalRecord/queries";

export default function AdminUsersPage() {
  // Obtener usuarios
  const { data: usersData, isLoading: isLoadingUsers } = useQuery<ProfessionalInfo[]>({
    queryKey: ['admin-users'],
    queryFn: () => UserQueries.getUsers(),
  });

  const SPECIALTY_ID_TELEMEDICINA_1 = '12';
  const SPECIALTY_ID_TELEMEDICINA_2 = '5';
  const [combinedCategories, setCombinedCategories] = useState<Category[]>([]);

  // Obtener categorías utilizando ambas especialidades
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

  // Transformar los datos al formato esperado por la tabla
  const users = useMemo(() => {
    if (!usersData) return [];

    // Transformar y ordenar alfabéticamente por nombre
    return usersData
      .map((user): AdminUser => ({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        externalProfessionalId: user.externalProfessionalId || '',
        consultationDuration: user.consultationDuration,
        picture: user.picture || '',
        calendarId: user.calendarId || '',
        categoryId: user.categoryId || '',
        role: user.role || 'user',
        calendarVisibility: user.calendarVisibility || false,
      }))
      .sort((a, b) => {
        // Ordenar primero por rol (admin primero, luego professional, luego user)
        if (a.role !== b.role) {
          if (a.role === 'admin') return -1;
          if (b.role === 'admin') return 1;
          if (a.role === 'professional') return -1;
          if (b.role === 'professional') return 1;
        }
        // Luego ordenar por nombre
        return a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName);
      });
  }, [usersData]);

  // Contexto para las columnas editables
  const tableContext = useMemo<EditableColumnContext>(() => ({
    categories: combinedCategories,
  }), [combinedCategories]);

  const isLoading = isLoadingUsers || isLoadingGeneral || isLoadingNutricion;

  return (
    <div className="container mx-auto py-4">
      <div className="flex flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-tertiary" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-medium">Administración de Usuarios</h1>
          <p className="text-sm text-gray-500">Gestiona los usuarios y sus permisos en el sistema</p>
        </div>
      </div>

      <div className="space-y-6 bg-white py-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="loader"></div>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <CompactSearchTable
                columns={columns}
                data={users}
                tableSize={20}
                className="h-[calc(100vh-280px)]"
                meta={tableContext}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}