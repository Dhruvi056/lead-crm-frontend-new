"use client";

import { useState, useEffect } from "react";
import { AddUserDrawer } from "@/components/add-user-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getAll, deleteOne } from "@/app/utils/api";
import Pagination from "@/components/Pagination";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive?: boolean;
  role?: string;
  phoneNumber?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(3); // rows per page
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerUser, setDrawerUser] = useState<User | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  const roleColors: Record<string, string> = {
    Admin: "bg-purple-100 text-purple-800",
    SuperAdmin: "bg-red-100 text-red-800",
  };

  // Fetch Users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: currentPage,
        limit,
        search: searchTerm || "",
        role:
          roleFilter !== "all"
            ? roleFilter === "SuperAdmin"
              ? "Superadmin"
              : roleFilter
            : "",
      };

      const data = await getAll("auth", params);
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      console.error("Fetch error:", err);
      if (err?.status === 401) {
        localStorage.removeItem("token");
        toast.error("Session expired. Please log in again.");
        router.push("/login");
      } else {
        toast.error("Failed to fetch users");
      }
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

 
  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, currentPage]);

  // Delete User
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteOne("auth", userToDelete._id);
      toast.success("User deleted successfully");
      fetchUsers();
      setConfirmDelete(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Something went wrong");
      setConfirmDelete(false);
    }
  };


  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={() => { setDrawerUser(null); setIsDrawerOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>
        {/* serch */}
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute top-2 left-3 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by firstName, lastName, or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={(value) => { setRoleFilter(value); setCurrentPage(1); }}>
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={`skeleton-${idx}`}>
                      <TableCell>
                        <div className="h-5 w-40  rounded-md shadow-md" />
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-64 animate-pulse rounded-md shadow-md" />
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-20 animate-pulse rounded-full shadow-md" />
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-28 animate-pulse rounded-md shadow-md" />
                      </TableCell>
                      <TableCell>
                        <div className="h-8 w-8 animate-pulse rounded-md shadow-md" />
                      </TableCell>
                    </TableRow>
                  ))
                  :users.length === 0
                  ?(
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                        No Users Found.
                      </TableCell>
                    </TableRow>
                  )
                : users
                    .filter((u: User) => u && u._id)
                    .map((u: User) => (
                      <TableRow key={u._id}>
                        <TableCell>{`${u.firstName} ${u.lastName}`}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              roleColors[u.role || ""] || "bg-gray-100 text-gray-800"
                            }
                          >
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{u.phoneNumber}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost">
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => {
                                  setDrawerUser(u);
                                  setIsDrawerOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setUserToDelete(u);
                                  setConfirmDelete(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className=" flex justify-center mt-6 mb-6 px-4 py-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      <AddUserDrawer
        open={isDrawerOpen}
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) fetchUsers();
        }}
        onSaved={fetchUsers}
        userData={drawerUser}
      />
      {/* delete */}
      {confirmDelete && userToDelete && (
        <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete User</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Are you sure you want to delete{" "}
                <strong>
                  {userToDelete.firstName} {userToDelete.lastName}
                </strong>
                ?
              </p>
            </div>
            <DialogFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                Yes, Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
