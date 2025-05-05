import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from '../ui/sidebar'
import { useAuth } from '@/context/AuthContext';

export default function Topbar() {
  const { user, isLoading } = useAuth();

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <SidebarTrigger />
        <h1 className="text-base ml-4 font-semibold text-gray-600">Dr. {user?.firstName} {user?.lastName}</h1>
        <div className="ml-auto flex items-center space-x-4">
          {isLoading ? (
            <div className="animate-pulse flex items-center gap-2">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
            </div>
          ) : user && (
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={user.picture} />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

