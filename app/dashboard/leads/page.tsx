"use client";

import { useEffect, useState, useRef } from "react";
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
import { getAll, deleteOne } from "@/app/utils/api";
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
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [editLead, setEditLead] = useState<any | null>(null);
  const [viewLead, setViewLead] = useState<any | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<any | null>(null);
  const currentUserId = "64f8b5c2d1234abcd567ef90";

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

      const leadsArray =
        response?.leads && Array.isArray(response.leads)
          ? response.leads
          : response?.data && Array.isArray(response.data)
            ? response.data
            : Array.isArray(response)
              ? response
              : [];

      const total =
        typeof response?.totalPages === "number"
          ? response.totalPages
          : response?.meta?.totalPages
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

  return (
    <div className="space-y-6 p-6">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <Button
          onClick={() => {
            setEditLead(null);
            setOpenDrawer(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {/* Filters */}
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
                <TableHead>Email</TableHead>
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

                          <DropdownMenuItem
                            onClick={() => {
                              setViewLead(lead);
                              setOpenViewDialog(true);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => handleEdit(lead)}>
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
      {/* View Lead */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Lead Details</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <p><strong>websiteURL:</strong> {viewLead?.websiteURL || "N/A"}</p>
            <p><strong>linkdinURL:</strong> {viewLead?.linkdinURL || "N/A"}</p>
            <p><strong>Industry:</strong> {viewLead?.industry || "N/A"}</p>
            <p><strong>WhatsApp Number:</strong> {viewLead?.whatsUpNumber || "N/A"}</p>
            <p><strong>Status:</strong> {viewLead?.status || "N/A"}</p>
            <p><strong>Priority:</strong> {viewLead?.priority || "N/A"}</p>
          </div>
          <DialogFooter className="flex justify-end">
            <Button variant="destructive" onClick={() => setOpenViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
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
