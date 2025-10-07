"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UsersIcon, User, LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        // Check if user data is already in localStorage first
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const first: string = user?.firstName || "";
          const last: string = user?.lastName || "";
          setRole(user?.role || "");
          const fi = first?.charAt(0)?.toUpperCase() || "A";
          const li = last?.charAt(0)?.toUpperCase() || "D";
          setInitials(`${fi}${li}`);
          // Do not return; still refresh from API to avoid stale cache
        }

        // Only fetch from API if not in localStorage
        const me = await getMe();
        const first: string = me?.user?.firstName || "";
        const last: string = me?.user?.lastName || "";
        setRole(me?.user?.role || "");
        const fi = first?.charAt(0)?.toUpperCase() || "A";
        const li = last?.charAt(0)?.toUpperCase() || "D";
        setInitials(`${fi}${li}`);
        
        // Store in localStorage for future use
        if (me?.user) {
          localStorage.setItem("user", JSON.stringify(me.user));
        }
      } catch (e) {
        console.error("Error fetching user data:", e);
      } finally {
        setIsLoading(false);
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
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  const handleEditProfile = () => {
    router.push("/dashboard/profile")
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  const isLeadDetailPage = /^\/dashboard\/leads\/[^/]+$/.test(pathname || "");

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link href="/dashboard/leads" className="flex items-center" aria-label="Go to Dashboard">
              <Image src="/cs logo.svg" alt="CS Logo" width={23} height={23} priority />
            </Link>
          </div>

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
        {/* Mobile sidebar overlay (hidden on detail page) */}
        {!isLeadDetailPage && isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
            onClick={closeMobileMenu}
          />
        )}

        {/* Sidebar (hidden on detail page) */}
        {!isLeadDetailPage && (
          <aside className={`
            fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 shadow-sm z-40
            transform transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
          `}>
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/dashboard/leads"
                    onClick={closeMobileMenu}
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
                      onClick={closeMobileMenu}
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
        )}

        {/* Main content - full width when sidebar hidden */}
        <main className={`w-full p-4 md:p-6 ${!isLeadDetailPage ? 'md:ml-64' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
