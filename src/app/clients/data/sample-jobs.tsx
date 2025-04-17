import { Job, JobStatus } from "@/types/job";
import { getJobs } from "@/services/jobService";

const getSampleJobs = async (): Promise<Job[]> => {
  try {
    const response = await getJobs();
    console.log('API Response:', response);
    
    // Extract jobs array from response
    const jobs = response && response.jobs ? response.jobs : [];
    
    if (!Array.isArray(jobs)) {
      console.error('Jobs data is not an array:', jobs);
      return [];
    }
    
    return jobs.map((job: any) => ({
      id: job._id,
      positionName: job.jobTitle,
      client: job.client?._id,
      location: job.location,
      headcount: job.headcount.toString(),
      stage: job.stage,
      minSalary: job.minimumSalary || job.salaryRange?.min,
      maxSalary: job.maximumSalary || job.salaryRange?.max,
      status: job.status || JobStatus.OPEN,
      department: job.department
    }));
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
};

export { getSampleJobs };