"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UsersIcon, User, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "react-hot-toast";

import { logout, getMe } from "@/app/utils/api"
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [initials, setInitials] = useState<string>("AD")
  const [role, setRole] = useState<string>("")

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        const first: string = me?.user?.firstName || "";
        const last: string = me?.user?.lastName || "";
        setRole(me?.user?.role || "")
        const fi = first?.charAt(0)?.toUpperCase() || "A";
        const li = last?.charAt(0)?.toUpperCase() || "D";
        setInitials(`${fi}${li}`)
      } catch (e) {
        // ignore
      }
    })();
  }, [])

    const handleLogout = async () => {
    try {
      await logout(); // call API
      toast.success("Logout Successful");
    } catch (error: any) {
      toast.error(`Logout Failed: ${error.message || "Unknown error"}`);
    } finally {
      localStorage.removeItem("token");
      router.push("/login");
    }
  };

  const handleEditProfile = () => {
    router.push("/dashboard/profile")
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem onClick={handleEditProfile}>
                <User className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex">
        <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 shadow-sm">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard/leads"
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === "/dashboard/leads"
                      ? "bg-red-50 text-red-700 border-r-2 border-primary"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <UsersIcon className="mr-3 h-4 w-4" />
                  Leads
                </Link>
              </li>
              {role === "SuperAdmin" && (
                <li>
                  <Link
                    href="/dashboard/users"
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === "/dashboard/users"
                        ? "bg-red-50 text-red-700 border-r-2 border-primary"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <User className="mr-3 h-4 w-4" />
                    Users
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </aside>
        <main className="ml-64 flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
