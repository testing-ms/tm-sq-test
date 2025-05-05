import { ColumnDef } from "@tanstack/react-table"
import { AdminUser, Category } from "@/services/users/types"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { UserQueries } from "@/services/users/queries"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Row } from "@tanstack/react-table"
import { ProfessionalInfo } from "@/services/Session/types"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type EditableColumnContext = {
  categories: Category[];
}

// Componente para editar la categoría
const CategoryCell = ({ row, context }: { row: Row<AdminUser>, context: EditableColumnContext }) => {
  const user = row.original
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Buscar la categoría actual
  const selectedCategory = context.categories.find(
    category => category.pc_catid == user.categoryId
  )

  const updateCategoryMutation = useMutation({
    mutationFn: (categoryId: string) => UserQueries.updateUserCategory(user.email, categoryId),
    onSuccess: (_, categoryId) => {
      toast.success("Categoría actualizada correctamente")
      queryClient.setQueryData(['admin-users'], (oldData: ProfessionalInfo[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(u =>
          u.email === user.email
            ? { ...u, categoryId }
            : u
        );
      });
      setOpen(false)
    },
    onError: () => {
      toast.error("Error al actualizar la categoría")
    },
    onSettled: () => {
      setIsUpdating(false)
    }
  })

  const handleSelectCategory = async (categoryId: string) => {
    try {
      setIsUpdating(true)
      updateCategoryMutation.mutate(categoryId)
    } catch (error) {
      console.error('Error al actualizar la categoría:', error)
      setIsUpdating(false)
    }
  }

  return (
    <div className="w-[200px]">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={isUpdating}>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            size="sm"
          >
            {isUpdating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" /> Actualizando...
              </span>
            ) : selectedCategory ? (
              <span className="truncate">{selectedCategory.pc_catname}</span>
            ) : (
              <span>Sin categoría</span>
            )}
            <ChevronsUpDown className="h-3 w-3 opacity-50 shrink-0 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Buscar categoría..." />
            <CommandList>
              <CommandEmpty>No se encontraron categorías</CommandEmpty>
              <CommandGroup>
                {context.categories.map((category) => (
                  <CommandItem
                    key={category.pc_catid}
                    value={category.pc_catname}
                    onSelect={() => handleSelectCategory(category.pc_catid)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        category.pc_catid == user.categoryId ? "opacity-100" : "opacity-0"
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
  )
}

// Componente para editar la visibilidad del calendario
const VisibilityCell = ({ row }: { row: Row<AdminUser> }) => {
  const user = row.original
  const queryClient = useQueryClient()
  const [isVisible, setIsVisible] = useState(user.calendarVisibility)
  const [isUpdating, setIsUpdating] = useState(false)

  const updateVisibilityMutation = useMutation({
    mutationFn: (visible: boolean) => UserQueries.updateCalendarVisibility(user.email, visible),
    onSuccess: () => {
      toast.success(`Agenda ${isVisible ? 'visible' : 'oculta'} correctamente`)
      queryClient.setQueryData(['admin-users'], (oldData: ProfessionalInfo[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(u =>
          u.email === user.email
            ? { ...u, calendarVisibility: isVisible }
            : u
        );
      });
    },
    onError: () => {
      toast.error("Error al actualizar la visibilidad de la agenda")
      setIsVisible(user.calendarVisibility)
    },
    onSettled: () => {
      setIsUpdating(false)
    }
  })

  const handleToggle = (visible: boolean) => {
    setIsVisible(visible)
    setIsUpdating(true)
    updateVisibilityMutation.mutate(visible)
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Switch
        checked={isVisible}
        onCheckedChange={handleToggle}
        disabled={isUpdating}
      />
      {isUpdating && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
    </div>
  )
}

export const columns: ColumnDef<AdminUser>[] = [
  {
    accessorKey: "firstName",
    header: "Nombre",
    enableSorting: false,
    cell: ({ row }) => {
      const firstName = row.getValue("firstName") as string
      const lastName = row.original.lastName as string
      return (
        <div className="max-w-[180px] truncate font-medium">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>{firstName} {lastName}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{firstName} {lastName}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    }
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: false,
    cell: ({ row }) => {
      const email = row.getValue("email") as string
      return (
        <div className="max-w-[220px] truncate text-gray-600">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>{email}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{email}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    }
  },
  {
    id: "category",
    header: "Categoría",
    size: 220,
    enableSorting: false,
    cell: ({ row, table }) => <CategoryCell row={row} context={table.options.meta as EditableColumnContext} />
  },
  {
    accessorKey: "role",
    header: "Rol",
    enableSorting: false,
    cell: ({ row }) => {
      const role = row.getValue("role") as string

      const getRoleName = (role: string) => {
        switch (role) {
          case 'admin':
            return 'Administrador'
          case 'professional':
            return 'Profesional'
          case 'user':
            return 'Usuario'
          default:
            return role
        }
      }

      const getRoleStyle = (role: string) => {
        switch (role) {
          case 'admin':
            return 'bg-purple-100 text-purple-800 border-purple-200'
          case 'professional':
            return 'bg-blue-100 text-blue-800 border-blue-200'
          case 'user':
            return 'bg-gray-100 text-gray-800 border-gray-200'
          default:
            return 'bg-gray-100 text-gray-800 border-gray-200'
        }
      }

      return (
        <Badge className={`px-2 py-1 ${getRoleStyle(role)} hover:${getRoleStyle(role)} text-xs`}>
          {getRoleName(role)}
        </Badge>
      )
    }
  },
  {
    accessorKey: "consultationDuration",
    header: "Duración Consulta",
    enableSorting: false,
    cell: ({ row }) => {
      const duration = row.getValue("consultationDuration") as number
      return (
        <div className="text-center">
          {duration} <span className="text-xs text-gray-500">min</span>
        </div>
      )
    }
  },
  {
    accessorKey: "externalProfessionalId",
    header: "ID Externo",
    enableSorting: false,
    cell: ({ row }) => {
      const id = row.getValue("externalProfessionalId") as string
      return (
        <div className="max-w-[100px] truncate text-gray-600">
          {id || "-"}
        </div>
      )
    }
  },
  {
    id: "visibility",
    header: "Agenda Visible",
    enableSorting: false,
    cell: ({ row }) => <VisibilityCell row={row} />
  }
]