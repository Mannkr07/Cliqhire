"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter, useParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, RefreshCcw, SlidersHorizontal, MoreVertical } from "lucide-react";
import { CreateClientModal } from "@/components/create-client-modal";
import { getSampleClients } from "@/app/clients/data/sample-clients";
import { ClientStageBadge } from "@/components/client-stage-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { differenceInYears } from 'date-fns';

interface Client {
  id: string;
  name: string;
  industry: string;
  location: string;
  stage: "Lead" | "Negotiation" | "Engaged" | "Signed";
  owner: string;
  team: string;
  createdAt: string;
  jobCount: number;
  incorporationDate: string;
}

type SortField = "name" | "industry" | "location" | "createdAt";
type SortOrder = "asc" | "desc";

interface SortConfig {
  field: SortField;
  order: SortOrder;
}

interface Filters {
  name: string;
  industry: string;
  maxAge: string;
}

export default function ClientsPage() {
  const router = useRouter();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewType, setViewType] = useState<"list" | "board">("list");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: "name", order: "asc" });
  const [filters, setFilters] = useState<Filters>({
    name: "",
    industry: "",
    maxAge: "",
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingChange, setPendingChange] = useState<{ clientId: string; stage: Client["stage"] } | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getSampleClients();
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchClients();
  }, []);

  function getYearDifference(createdAt: string) {
    const createdDate = new Date(createdAt);
    const today = new Date();
    return differenceInYears(today, createdDate);
  }

  const calculateAge = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));
    return diffMonths;
  };

  const handleStageChange = (clientId: string, newStage: Client["stage"]) => {
    setPendingChange({ clientId, stage: newStage });
    setShowConfirmDialog(true);
  };

  const filteredAndSortedClients = useMemo(() => {
    let result = [...clients];

    if (filters.name) {
      result = result.filter((client) =>
        client.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.industry) {
      result = result.filter((client) =>
        client.industry.toLowerCase().includes(filters.industry.toLowerCase())
      );
    }
    if (filters.maxAge) {
      const maxAgeMonths = parseInt(filters.maxAge);
      if (!isNaN(maxAgeMonths)) {
        result = result.filter(
          (client) => calculateAge(client.createdAt) <= maxAgeMonths
        );
      }
    }

    result.sort((a, b) => {
      if (a[sortConfig.field] < b[sortConfig.field]) {
        return sortConfig.order === "asc" ? -1 : 1;
      }
      if (a[sortConfig.field] > b[sortConfig.field]) {
        return sortConfig.order === "asc" ? 1 : -1;
      }
      return 0;
    });

    return result;
  }, [sortConfig, filters, clients]);

  const handleConfirmChange = async () => {
    if (!pendingChange) return;

    setIsUpdating(true);
    
    try {
      // Optimistically update the UI
      setClients(prevClients =>
        prevClients.map(client =>
          client.id === pendingChange.clientId 
            ? { ...client, stage: pendingChange.stage } 
            : client
        )
      );

      // Make the API call
      const response = await fetch(`https://aems-backend.onrender.com/api/clients/${pendingChange.clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientStage: pendingChange.stage }),
      });

      if (!response.ok) {
        throw new Error('Failed to update client stage');
      }
    } catch (error) {
      console.error('Error updating client stage:', error);
      // Revert the UI change if the API call fails
      setClients(prevClients =>
        prevClients.map(client =>
          client.id === pendingChange.clientId 
            ? { ...client, stage: clients.find(c => c.id === pendingChange.clientId)?.stage || "Lead" } 
            : client
        )
      );
    } finally {
      setIsUpdating(false);
      setPendingChange(null);
      setShowConfirmDialog(false);
    }
  };

  const handleCancelChange = () => {
    setPendingChange(null);
    setShowConfirmDialog(false);
  };

  return (
    <>
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Stage Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to update the client stage?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelChange} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleConfirmChange} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-2xl font-semibold">Clients</h1>
            <div className="ml-auto flex items-center space-x-2">
              <Button
                variant={viewType === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("list")}
              >
                LIST
              </Button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4">
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Client
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setFilterOpen(true)}>
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        {viewType === "list" && (
          <div className="flex-1">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs uppercase text-muted-foreground font-medium">
                    Client Name
                  </TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground font-medium">
                    Client Industry
                  </TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground font-medium">
                    Client Location
                  </TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground font-medium">
                    Client Stage
                  </TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground font-medium">
                    Client Rm
                  </TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground font-medium">
                    Client Team
                  </TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground font-medium">
                    Client Age
                  </TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground font-medium">
                    Job Count
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-[calc(100vh-240px)] text-center">
                      <div className="py-24">
                        <div className="text-center">Loading clients...</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredAndSortedClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-[calc(100vh-240px)] text-center">
                      <div className="py-24">
                        <div className="text-center">No clients found</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedClients.map((client) => (
                    <TableRow
                      key={client.id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={(e) => {
                        if (!(e.target as HTMLElement).closest('.client-stage-badge')) {
                          router.push(`/clients/${client.id}`);
                        }
                      }}
                    >
                      <TableCell className="text-sm font-medium">{client.name}</TableCell>
                      <TableCell className="text-sm">{client.industry}</TableCell>
                      <TableCell className="text-sm">{client.location}</TableCell>
                      <TableCell className="text-sm">
                        <ClientStageBadge
                          id={client.id}
                          stage={client.stage}
                          onStageChange={handleStageChange}
                        />
                      </TableCell>
                      <TableCell className="text-sm">{client.owner}</TableCell>
                      <TableCell className="text-sm">{client.team}</TableCell>
                      <TableCell className="text-sm">
                        {client.incorporationDate ? `${getYearDifference(client.incorporationDate)} years` : "0 years"}
                      </TableCell>
                      <TableCell className="text-sm">{client.jobCount}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <CreateClientModal open={open} onOpenChange={setOpen} />
      </div>

      {/* Filters Modal */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="name-filter">Client Name</Label>
              <Input
                id="name-filter"
                placeholder="Enter client name"
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="industry-filter">Client Industry</Label>
              <Input
                id="industry-filter"
                placeholder="Enter client industry"
                value={filters.industry}
                onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="age-filter">Client Age (months)</Label>
              <Input
                id="age-filter"
                placeholder="Enter max age"
                value={filters.maxAge}
                onChange={(e) => setFilters({ ...filters, maxAge: e.target.value })}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}