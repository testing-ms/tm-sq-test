import { CalendarListResponse } from "@/services/Calendar/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProfessionalHeaderProps {
  professional: CalendarListResponse;
}

export function ProfessionalHeader({ professional }: ProfessionalHeaderProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="p-4 border-r h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {getInitials(
              professional.professional.firstName,
              professional.professional.lastName
            )}
          </AvatarFallback>
        </Avatar>
        <div className="font-medium text-sm">
          {professional.professional.firstName} {professional.professional.lastName}
        </div>
      </div>
    </div>
  );
}