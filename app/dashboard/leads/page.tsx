"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import Pagination from "@/components/Pagination";
import AddLeadDrawer from "@/components/add-lead-drawer";
import EditLeadDrawer from "@/components/EditLeadDrawer";
import { getAll, deleteOne, getMe } from "@/app/utils/api";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [editLead, setEditLead] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<any | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

 const fetchLeads = async () => {
  try {
    setLoading(true);

    const params: Record<string, any> = {
      page: currentPage,
      limit,
    };
    if (searchTerm?.trim()) params.search = searchTerm.trim();
    if (statusFilter && statusFilter !== "all") params.status = statusFilter;

    const response = await getAll("lead", params);

    const leadsArray = Array.isArray(response?.data) ? response.data : [];
    const total =
      typeof response?.meta?.totalPages === "number"
        ? response.meta.totalPages
        : 1;

    setLeads(leadsArray);
    setTotalPages(total > 0 ? total : 1);
  } catch (error: any) {
    console.error("Fetch leads error:", error);
    toast.error("Failed to fetch leads");
    setLeads([]);
    setTotalPages(1);
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (id: string) => {
    try {
      await deleteOne("lead", id);
      toast.success("Lead deleted successfully");
      fetchLeads();
    } catch (error) {
      toast.error("Failed to delete lead");
    }
  };
  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;
    await handleDelete(leadToDelete._id);
    setConfirmDelete(false);
    setLeadToDelete(null);
  };

  const handleEdit = (lead: any) => {
    setEditLead(lead);
    setOpenEditDrawer(true);
  };

  useEffect(() => {
    fetchLeads();
  }, [currentPage, searchTerm, statusFilter]);
  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        const id = me?.user?._id || "";
        if (id) {
          setCurrentUserId(id);
          localStorage.setItem("user", JSON.stringify(me.user));
        } else {
          setCurrentUserId("");
          localStorage.removeItem("user");
        }
      } catch {
        setCurrentUserId("");
      }
    })();
  }, []);

  return (
    <div className="space-y-6 p-6">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <Button
          onClick={() => {
            setEditLead(null);
            setOpenDrawer(true);
          }}
          disabled={!currentUserId}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by firstName or email "
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">ACTIVE</SelectItem>
            <SelectItem value="inactive">INACTIVE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>First Name</TableHead>
                <TableHead>Email address</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={`lead-skeleton-${idx}`}>
                    <TableCell>
                      <div className="h-5 w-40  rounded-md shadow-md" />
                    </TableCell>
                    <TableCell>
                      <div className="h-5 w-64 animate-pulse rounded-md shadow-md" />
                    </TableCell>
                    <TableCell>
                      <div className="h-5 w-32 animate-pulse rounded-md shadow-md" />
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-20 animate-pulse rounded-full shadow-md" />
                    </TableCell>
                    <TableCell>
                      <div className="h-8 w-8 animate-pulse rounded-md shadow-md" />
                    </TableCell>
                  </TableRow>
                ))
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead._id}>
                    <TableCell>{lead.firstName}</TableCell>
                    <TableCell>{
                      Array.isArray(lead.email)
                        ? (lead.email.length ? lead.email.join(", ") : "N/A")
                        : Array.isArray(lead.emails)
                          ? (lead.emails.length ? lead.emails.join(", ") : "N/A")
                          : (lead.email ? lead.email : "N/A")
                    }</TableCell>
                    <TableCell>{lead.whatsUpNumber}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          lead.status === "ACTIVE" ? "secondary" : "destructive"
                        }
                      >
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>

                          <DropdownMenuItem onClick={() => router.push(`/dashboard/leads/${lead._id}`)}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(lead)} disabled={!currentUserId}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setLeadToDelete(lead);
                              setConfirmDelete(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="mt-6 mb-6 px-4 py-2 flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
      <AddLeadDrawer
        open={openDrawer}
        onOpenChange={setOpenDrawer}
        currentUserId={currentUserId}
        onSaved={() => {
          fetchLeads();
          toast.success("Lead created successfully");
        }}
      />
      <EditLeadDrawer
        open={openEditDrawer}
        onOpenChange={setOpenEditDrawer}
        currentUserId={currentUserId}
        leadData={editLead}
        onSaved={() => {
          fetchLeads();
          toast.success("Lead updated successfully");
        }}
      />
      {confirmDelete && leadToDelete && (
        <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Lead</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Are you sure you want to delete{" "}
                <strong>{leadToDelete.firstName}</strong>?
              </p>
            </div>
            <DialogFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Yes, Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
