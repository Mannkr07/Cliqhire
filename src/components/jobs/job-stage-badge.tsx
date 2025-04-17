import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Job, JobStage } from "@/types/job"
import { ChevronDown } from "lucide-react"

const stageColors: Record<JobStage, string> = {
  'New': "bg-blue-100 text-blue-800",
  'Sourcing': "bg-purple-100 text-purple-800",
  'Screening': "bg-yellow-100 text-yellow-800",
  'Interviewing': "bg-orange-100 text-orange-800",
  'Shortlisted': "bg-indigo-100 text-indigo-800",
  'Offer': "bg-pink-100 text-pink-800",
  'Hired': "bg-green-100 text-green-800",
  'On Hold': "bg-gray-100 text-gray-800",
  'Cancelled': "bg-red-100 text-red-800",
}

const stages: JobStage[] = [
  'New',
  'Sourcing',
  'Screening',
  'Interviewing',
  'Shortlisted',
  'Offer',
  'Hired',
  'On Hold',
  'Cancelled'
]

interface JobStageBadgeProps {
  stage: JobStage
  onStageChange: (newStage: JobStage) => void
}

export function JobStageBadge({ stage, onStageChange }: JobStageBadgeProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-auto p-0 hover:bg-transparent"
        >
          <Badge 
            variant="secondary" 
            className={`${stageColors[stage]} border-none flex items-center gap-1`}
          >
            {stage}
            <ChevronDown className="h-3 w-3" />
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {stages.map((stageOption) => (
          <DropdownMenuItem
            key={stageOption}
            onClick={(e: any) => {
              e.stopPropagation()
              onStageChange(stageOption)
            }}
            className="flex items-center gap-2"
          >
            <Badge 
              variant="secondary" 
              className={`${stageColors[stageOption]} border-none`}
            >
              {stageOption}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}