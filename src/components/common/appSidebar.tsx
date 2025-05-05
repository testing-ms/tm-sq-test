import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Link, useLocation } from 'react-router-dom'
import { USER_ROUTES, ADMIN_ROUTES } from '@/routes/routes'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { IssuesCounter } from './IssuesCounter'

export function AppSidebar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth();

  const isAdmin = user?.role === 'admin';
  const routes = isAdmin ? ADMIN_ROUTES : USER_ROUTES;
  const homeRoute = isAdmin ? ADMIN_ROUTES.CALENDARS : USER_ROUTES.HOME;

  return (
    <Sidebar>
      <SidebarHeader className='bg-white h-16 flex items-center justify-center'>
        <SidebarMenu>
          <SidebarMenuItem>
              <Link to={homeRoute.path}>
              <div className="flex items-center gap-4 flex-row">
                <div className="flex aspect-square size-8 ml-1 items-center justify-center rounded-lg bg-tertiary text-white">
                  <homeRoute.icon className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none text-tertiary">
                  <span className="font-semibold">{isAdmin ? 'Admin Panel' : 'Portal Telemedicina'}</span>
                </div>
              </div>
              </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className='bg-white'>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <SidebarMenu className='h-full'>
            {Object.values(routes).map((route) =>
              route.visible && (
                <SidebarMenuItem className='p-2 py-0' key={route.path}>
                  <SidebarMenuButton size="lg" asChild isActive={pathname === route.path}>
                    <Link to={route.path} className="relative">
                      <route.icon size={32} className="mr-2" />
                      <p className="text-base">{route.title}</p>
                      {route.path === USER_ROUTES.WAITING_ROOM_ISSUES.path && !isAdmin && (
                        <IssuesCounter />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            )}
            <SidebarMenuItem className='mt-auto absolute bottom-0 w-full'>
              <Button
                variant="ghost"
                className="w-full h-12 text-gray-500 hover:text-tertiary hover:bg-tertiary/5 justify-start px-4"
                onClick={logout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Cerrar sesión
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}