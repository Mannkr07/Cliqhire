"use client"

import { Button } from "@/components/ui/button"
import { Pencil, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { getJobById } from "@/services/jobService"

interface SummaryContentProps {
  jobId: string;
}

interface JobDetails {
  jobTitle: string;
  department: string;
  client: string;
  location: string;
  headcount: number;
  minimumSalary: number;
  maximumSalary: number;
  salaryCurrency: string;
  jobType: string;
  experience: string;
  jobDescription: string;
  nationalities: string[];
}

export function SummaryContent({ jobId }: SummaryContentProps) {
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await getJobById(jobId)
        setJobDetails({
          jobTitle: response.jobTitle,
          department: response.department,
          client: response.client.name,
          location: response.location,
          headcount: response.headcount,
          minimumSalary: response.minimumSalary,
          maximumSalary: response.maximumSalary,
          salaryCurrency: "USD", // Default value as salaryCurrency is not in JobResponse
          jobType: response.jobType,
          experience: response.experience,
          jobDescription: "jobDescription" in response ? (response.jobDescription as string) : "No description available",
          nationalities: "nationalities" in response ? (response.nationalities as string[]) : []
        })
      } catch (error) {
        console.error("Error fetching job details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobDetails()
  }, [jobId])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column - Job Description */}
      <div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Job Description</h2>
          <div className="bg-white rounded border p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-muted-foreground">Job Description</h3>
              <Button variant="outline" size="sm" className="h-8 text-black">
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
            <div className="text-sm">
              {jobDetails?.jobDescription || "No description added yet"}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Job Details */}
      <div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Job Details</h2>
          <div className="bg-white rounded border p-4 space-y-4">
            <DetailRow 
              label="Job Title" 
              value={jobDetails?.jobTitle} 
            />
            <DetailRow 
              label="Department" 
              value={jobDetails?.department} 
            />
            <DetailRow 
              label="Client" 
              value={jobDetails?.client} 
            />
            <DetailRow 
              label="Job Location" 
              value={jobDetails?.location} 
            />
            <DetailRow 
              label="Headcount" 
              value={jobDetails?.headcount?.toString()} 
            />
            <DetailRow 
              label="Job Type" 
              value={jobDetails?.jobType} 
            />
            <DetailRow 
              label="Experience Required" 
              value={jobDetails?.experience} 
            />
            <DetailRow 
              label="Minimum Salary" 
              value={jobDetails?.minimumSalary ? `${jobDetails.salaryCurrency} ${jobDetails.minimumSalary}` : undefined} 
            />
            <DetailRow 
              label="Maximum Salary" 
              value={jobDetails?.maximumSalary ? `${jobDetails.salaryCurrency} ${jobDetails.maximumSalary}` : undefined} 
            />
            <DetailRow 
              label="Preferred Nationalities" 
              value={jobDetails?.nationalities?.join(", ")} 
            />
          </div>

          {/* Package Details Section */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Package Details</h2>
            <div className="bg-white rounded border p-4">
              <DetailRow 
                label="Package Details" 
                value={`${jobDetails?.salaryCurrency} ${jobDetails?.minimumSalary} - ${jobDetails?.maximumSalary} per annum`} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface DetailRowProps {
  label: string
  value?: string
  addButton?: boolean
}

function DetailRow({ label, value, addButton }: DetailRowProps) {
  return (
    <div className="flex items-center py-2 border-b last:border-b-0">
      <span className="text-sm text-muted-foreground w-1/3">{label}</span>
      <div className="flex items-center justify-between flex-1">
        <span className="text-sm">{value || "No Details"}</span>
        {value ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-black"
          >
            <Pencil className="h-3 w-3 mr-1" />
            Edit
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-black"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        )}
      </div>
    </div>
  )
}