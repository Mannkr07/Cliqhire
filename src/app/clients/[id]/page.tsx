'use client';

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, SlidersHorizontal, RefreshCcw } from "lucide-react"
import { notFound } from "next/navigation"
import { ClientTabs } from "@/components/clients/client-tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Job, JobStage } from "@/types/job"
import { getSampleJobs } from "@/app/clients/data/sample-jobs"
import { ClientStageBadge } from "@/components/client-stage-badge"
import { CreateJobModal } from "@/components/jobs/create-job-modal"

interface PageProps {
  params: { id: string }
}

interface FilterState {
  jobStage: Job['stage'] | ''
  location: string
  minSalary: string
  maxSalary: string
}

const jobStages: JobStage[] = [
  "New" as JobStage, "Sourcing" as JobStage, "Screening" as JobStage, "Interviewing" as JobStage, "Shortlisted" as JobStage,
  "Offer" as JobStage, "Hired" as JobStage, "On Hold" as JobStage, "Cancelled" as JobStage
];

const stageColors = {
  New: "bg-blue-100 text-blue-800",
  Sourcing: "bg-purple-100 text-purple-800",
  Screening: "bg-yellow-100 text-yellow-800",
  Interviewing: "bg-orange-100 text-orange-800",
  Shortlisted: "bg-indigo-100 text-indigo-800",
  Offer: "bg-pink-100 text-pink-800",
  Hired: "bg-green-100 text-green-800",
  'On Hold': "bg-gray-100 text-gray-800",
  Cancelled: "bg-red-100 text-red-800",
} as const

export default function ClientPage({ params }: PageProps) {
  const { id } = params; // Remove the use() hook and directly destructure from params
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    jobStage: '',
    location: '',
    minSalary: '',
    maxSalary: ''
  });
  const [client, setClient] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [clientJobs, setClientJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchClientData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://aems-backend.onrender.com/api/clients/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error("Failed to fetch client data");
        }
        const data = await response.json();
        setClient(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
        console.error("Error fetching client:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [id]);

  useEffect(() => {
    const fetchJobs = async () => {
      const jobs = await getSampleJobs();
      setClientJobs(jobs.filter(job => job.client === id));
    };

    fetchJobs();
  }, [id]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFilters({ jobStage: '', location: '', minSalary: '', maxSalary: '' });
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !client) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client data...</p>
        </div>
      </div>
    );
  }

  const filteredJobs = clientJobs.filter(job => {
    if (filters.jobStage && job.stage !== filters.jobStage) return false;
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.minSalary) {
      if (job.minSalary) {
        const jobMinSalary = job.minSalary;
        if (isNaN(jobMinSalary) || jobMinSalary < parseInt(filters.minSalary)) return false;
      }
    }
    if (filters.maxSalary) {
      if (job.maxSalary) {
        const jobMaxSalary = job.maxSalary;
        if (isNaN(jobMaxSalary) || jobMaxSalary > parseInt(filters.maxSalary)) return false;
      }
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">{client.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{client.industry}</span>
              <span>•</span>
              <span>{client.location}</span>
              <span>•</span>
              <ClientStageBadge stage={client.clientStage} />
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://wa.me/1234567890', '_blank')}
          >
            WhatsApp
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-4">
        <Button size="sm" onClick={() => setIsCreateJobOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Job Requirment
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)}>
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <ClientTabs clientId={id} filteredJobs={filteredJobs} clientName={client.name} />
      </div>

      {/* Filter Dialog */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Jobs</DialogTitle>
          </DialogHeader>
          <form>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Job Stage</Label>
                <Select 
                  value={filters.jobStage} 
                  onValueChange={value => {
                    setFilters(prev => ({ ...prev, jobStage: value as Job['stage'] }));
                    clientJobs.forEach(job => {
                      if (job.stage !== value) {
                        console.log(job.id);
                        console.log(value as Job['stage']);
                      }
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobStages.map(stage => (
                      <SelectItem key={stage} value={stage}>
                        <Badge className={stageColors[stage]}>{stage}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Job Modal */}
      <CreateJobModal 
        open={isCreateJobOpen}
        onOpenChange={setIsCreateJobOpen}
      />
    </div>
  );
}