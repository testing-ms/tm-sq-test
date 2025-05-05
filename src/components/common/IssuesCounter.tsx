import { useQuery } from "@tanstack/react-query";
import { WaitingRoomIssuesService } from "@/services/waiting-room/waiting-room-issues.queries";
import { useAuth } from "@/context/AuthContext";

export function IssuesCounter() {
  const { user } = useAuth();

  const { data: count = 0 } = useQuery({
    queryKey: ['waiting-room-issues-count'],
    queryFn: () => WaitingRoomIssuesService.getPendingIssuesCount(),
    enabled: !!user,
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  if (!count) return null;

  return (
    <div className="min-w-[1.25rem] h-5 flex items-center justify-center rounded-full bg-red-500 text-[0.625rem] font-medium text-white absolute right-1 top-4">
      {count}
    </div>
  );
}