import { Job } from "@/types/job";
import axios from "axios";
import exp from "constants";

interface JobData {
  jobTitle: string;
  department: string;
  client: string;
  jobPosition: string;
  location: string;
  headcount: number;
  stage: string;
  minimumSalary: number;
  maximumSalary: number;
  jobType: string;
  experience: string;
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  nationalities: string[];
  gender: string;
  deadline: string;
  relationshipManager: string;
  reportingTo: string;
  teamSize: number;
  link: string;
  keySkills: string;
  jobDescription: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface Jobs {
  _id: string;
  jobTitle: string;
  department: string;
  client: {
    _id: string;
    name: string;
  };
  jobPosition: string;
  location: string;
  headcount: number;
  stage: string;
  minimumSalary: number;
  maximumSalary: number;
  salaryCurrency: string;
  jobType: string;
  experience: string;
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  nationalities: string[];
  gender: string;
  deadline: string;
  relationshipManager: string;
  reportingTo: string;
  teamSize: number;
  link: string;
  keySkills: string;
  jobDescription: string;
  dateRange: {
    start: string;
    end: string;
  };
  createdAt: string;
}

export interface JobResponse {
  jobs: Jobs[]
}

const API_URL = "https://aems-backend.onrender.com/api";

const createJob = async (jobData: JobData) => {
  try {
    const response = await axios.post(`${API_URL}/jobs`, jobData);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorMessage = error.response.data?.message || 'Unknown error occurred';
      console.error('Server response:', error.response.data);
      throw new Error(`Error creating job: ${errorMessage}`);
    }
    throw new Error(`Error creating job: ${error.message}`);
  }
};

const getJobs = async (): Promise<JobResponse> => {
  try {
    const response = await axios.get(`${API_URL}/jobs`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorMessage = error.response.data?.message || 'Unknown error occurred';
      console.error('Server response:', error.response.data);
      throw new Error(`Error fetching jobs: ${errorMessage}`);
    }
    throw new Error(`Error fetching jobs: ${error.message}`);
  }
};

const getJobById = async (id: string): Promise<Jobs> => {
  try {
    const response = await axios.get(`${API_URL}/jobs/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorMessage = error.response.data?.message || 'Unknown error occurred';
      console.error('Server response:', error.response.data);
      throw new Error(`Error fetching job: ${errorMessage}`);
    }
    throw new Error(`Error fetching job: ${error.message}`);
  }
};

const updateJobById = async (id: string, jobData: JobData) => {
  try {
    const response = await axios.patch(`${API_URL}/jobs/${id}`, jobData);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorMessage = error.response.data?.message || 'Unknown error occurred';
      console.error('Server response:', error.response.data);
      throw new Error(`Error updating job: ${errorMessage}`);
    }
    throw new Error(`Error updating job: ${error.message}`);
  }
};

const deleteJobById = async (id: string) => {
  try {
    const response = await axios.delete(`${API_URL}/jobs/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorMessage = error.response.data?.message || 'Unknown error occurred';
      console.error('Server response:', error.response.data);
      throw new Error(`Error deleting job: ${errorMessage}`);
    }
    throw new Error(`Error deleting job: ${error.message}`);
  }
};

export { createJob, getJobs, getJobById, updateJobById, deleteJobById };