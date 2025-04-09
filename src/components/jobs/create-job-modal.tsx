"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { createJob } from "@/services/jobService"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import axios from "axios"
import * as Flags from 'country-flag-icons/react/3x2'
import React from "react"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { JobStage } from "@/types/job"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface CreateJobModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface LocationSuggestion {
  display_name: string
  lat: string
  lon: string
}

interface CountrySuggestion {
  name: {
    common: string
  }
  flags: {
    svg: string
  }
}

const recruitmentTypes = [
  "Full time",
  "Part time",
  "Project based",
  "Outsourcing"
]

const jobStages: JobStage[] = [
  "New",
  "Sourcing",
  "Screening", 
  "Interviewing",
  "Shortlisted",
  "Offer",
  "Hired",
  "On Hold",
  "Cancelled"
]

// Currency options with flags
const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: 'US' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: 'EU' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: 'GB' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: 'JP' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: 'AU' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: 'CA' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', flag: 'CH' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: 'CN' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: 'IN' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', flag: 'SA' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: 'AE' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', flag: 'KW' },
  { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar', flag: 'BH' },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal', flag: 'QA' },
  { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial', flag: 'OM' }
]

export function CreateJobModal({ open, onOpenChange }: CreateJobModalProps) {
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [countrySuggestions, setCountrySuggestions] = useState<CountrySuggestion[]>([])
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false)
  const [selectedNationalities, setSelectedNationalities] = useState<string[]>([])
  const [searchNationality, setSearchNationality] = useState("")
  
  const [formData, setFormData] = useState({
    jobTitle: "",
    client: "",
    relationshipManager: "",
    recruitmentType: "",
    stage: "New" as JobStage,
    deadline: null as Date | null,
    dateRange: {
      start: null as Date | null,
      end: null as Date | null
    },
    salaryRange: {
      min: "",
      max: "",
      currency: "USD"
    },
    nationalities: [] as string[],
    location: "",
    gender: "",
    numberOfPositions: "",
    experience: "",
    reportingTo: "",
    teamSize: "",
    link: "",
    keySkills: "",
    jobDescription: ""
  })

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content: formData.jobDescription,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({
        ...prev,
        jobDescription: editor.getHTML()
      }))
    }
  })

  // Nationality search and suggestions
  useEffect(() => {
    const fetchCountrySuggestions = async () => {
      if (searchNationality.length < 2) {
        setCountrySuggestions([])
        return
      }

      try {
        const response = await axios.get(
          `https://restcountries.com/v3.1/name/${encodeURIComponent(searchNationality)}?fields=name,flags`
        )
        setCountrySuggestions(response.data)
        setShowCountrySuggestions(true)
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setCountrySuggestions([])
        } else {
          console.error("Error fetching country suggestions:", error)
        }
      }
    }

    const debounceTimer = setTimeout(fetchCountrySuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchNationality])

  useEffect(() => {
    const fetchLocationSuggestions = async () => {
      if (formData.location.length < 3) {
        setLocationSuggestions([])
        return
      }

      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}`
        )
        setLocationSuggestions(response.data)
        setShowLocationSuggestions(true)
      } catch (error) {
        console.error("Error fetching location suggestions:", error)
      }
    }

    const debounceTimer = setTimeout(fetchLocationSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [formData.location])

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    setFormData(prev => ({
      ...prev,
      location: suggestion.display_name
    }))
    setShowLocationSuggestions(false)
  }

  const handleNationalitySelect = (country: CountrySuggestion) => {
    const nationality = country.name.common
    if (!selectedNationalities.includes(nationality)) {
      setSelectedNationalities(prev => [...prev, nationality])
      setFormData(prev => ({
        ...prev,
        nationalities: [...prev.nationalities, nationality]
      }))
    }
    setSearchNationality("")
    setShowCountrySuggestions(false)
  }

  const removeNationality = (nationalityToRemove: string) => {
    setSelectedNationalities(prev => 
      prev.filter(nationality => nationality !== nationalityToRemove)
    )
    setFormData(prev => ({
      ...prev,
      nationalities: prev.nationalities.filter(n => n !== nationalityToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const jobData = {
        jobTitle: formData.jobTitle,
        department: "General", // Default department
        client: formData.client,
        jobPosition: formData.jobTitle,
        location: formData.location,
        headcount: parseInt(formData.numberOfPositions) || 1,
        stage: formData.stage,
        minimumSalary: parseInt(formData.salaryRange.min) || 0,
        maximumSalary: parseInt(formData.salaryRange.max) || 0,
        salaryCurrency: formData.salaryRange.currency,
        jobType: formData.recruitmentType,
        experience: formData.experience,
        jobDescription: formData.jobDescription,
        nationalities: formData.nationalities,
        salaryRange: {
          min: parseInt(formData.salaryRange.min) || 0,
          max: parseInt(formData.salaryRange.max) || 0,
          currency: formData.salaryRange.currency
        }
      }

      const response = await createJob(jobData)
      console.log("Job created successfully:", response)
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error creating job:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Job Requirement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                placeholder="Type new job title here"
                value={formData.jobTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="client">Client</Label>
              <Select
                value={formData.client}
                onValueChange={(value) => setFormData(prev => ({ ...prev, client: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client1">Client 1</SelectItem>
                  <SelectItem value="client2">Client 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="relationshipManager">Relationship Manager</Label>
              <Input
                id="relationshipManager"
                value={formData.relationshipManager}
                onChange={(e) => setFormData(prev => ({ ...prev, relationshipManager: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="recruitmentType">Recruitment Type</Label>
              <Select
                value={formData.recruitmentType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, recruitmentType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {recruitmentTypes.map(type => (
                    <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="stage">Job Stage</Label>
              <Select
                value={formData.stage}
                onValueChange={(value: JobStage) => setFormData(prev => ({ ...prev, stage: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {jobStages.map(stage => (
                    <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Deadline (by client)</Label>
              <DatePicker
                selected={formData.deadline}
                onChange={(date) => setFormData(prev => ({ ...prev, deadline: date }))}
                dateFormat="dd/MM/yyyy"
                className="w-full p-2 border rounded-md"
                placeholderText="Select deadline"
              />
            </div>

            <div className="grid gap-2">
              <Label>Date Range</Label>
              <div className="flex gap-2 items-center">
                <DatePicker
                  selected={formData.dateRange.start}
                  onChange={(date) => setFormData(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: date }
                  }))}
                  dateFormat="dd/MM/yyyy"
                  className="w-full p-2 border rounded-md"
                  placeholderText="Start date"
                />
                <span>to</span>
                <DatePicker
                  selected={formData.dateRange.end}
                  onChange={(date) => setFormData(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: date }
                  }))}
                  dateFormat="dd/MM/yyyy"
                  className="w-full p-2 border rounded-md"
                  placeholderText="End date"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Salary Range</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.salaryRange.currency}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    salaryRange: { ...prev.salaryRange, currency: value }
                  }))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue>
                      {formData.salaryRange.currency && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-3">
                            {currencies.find(c => c.code === formData.salaryRange.currency)?.flag && (
                              // @ts-ignore
                              React.createElement(Flags[currencies.find(c => c.code === formData.salaryRange.currency)?.flag || ''])
                            )}
                          </div>
                          <span>{formData.salaryRange.currency}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-3">
                            {/* @ts-ignore */}
                            {Flags[currency.flag] && React.createElement(Flags[currency.flag])}
                          </div>
                          <span>{currency.name}</span>
                          <span className="text-muted-foreground ml-auto">{currency.symbol}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Min"
                  type="number"
                  value={formData.salaryRange.min}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    salaryRange: { ...prev.salaryRange, min: e.target.value }
                  }))}
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={formData.salaryRange.max}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    salaryRange: { ...prev.salaryRange, max: e.target.value }
                  }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nationality">Nationalities</Label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border rounded-md">
                  {selectedNationalities.map((nationality) => (
                    <Badge key={nationality} variant="secondary" className="flex items-center gap-1">
                      {nationality}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => removeNationality(nationality)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="relative">
                  <Input
                    value={searchNationality}
                    onChange={(e) => setSearchNationality(e.target.value)}
                    placeholder="Search and select nationalities"
                  />
                  {showCountrySuggestions && countrySuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      {countrySuggestions.map((country, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                          onClick={() => handleNationalitySelect(country)}
                        >
                          <img src={country.flags.svg} alt={`${country.name.common} flag`} className="w-6 h-4 object-cover" />
                          <span>{country.name.common}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Job Location</Label>
              <div className="relative">
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  onFocus={() => setShowLocationSuggestions(true)}
                />
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {locationSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleLocationSelect(suggestion)}
                      >
                        {suggestion.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="any">Any</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="numberOfPositions">Number of Positions</Label>
              <Input
                id="numberOfPositions"
                type="number"
                min="1"
                value={formData.numberOfPositions}
                onChange={(e) => setFormData(prev => ({ ...prev, numberOfPositions: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="experience">Experience</Label>
              <Input
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                placeholder="e.g. 5 years"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reportingTo">Reporting To</Label>
              <Input
                id="reportingTo"
                value={formData.reportingTo}
                onChange={(e) => setFormData(prev => ({ ...prev, reportingTo: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="teamSize">Team Size</Label>
              <Input
                id="teamSize"
                type="number"
                min="0"
                value={formData.teamSize}
                onChange={(e) => setFormData(prev => ({ ...prev, teamSize: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="link">Link</Label>
              <Input
                id="link"
                type="url"
                value={formData.link}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                placeholder="https://"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="keySkills">Key Skills</Label>
              <Input
                id="keySkills"
                value={formData.keySkills}
                onChange={(e) => setFormData(prev => ({ ...prev, keySkills: e.target.value }))}
                placeholder="Enter key skills required"
              />
            </div>

            <div className="grid gap-2">
              <Label>Job Description</Label>
              <div className="border rounded-lg">
                <EditorContent editor={editor} className="min-h-[200px] p-4" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Create Job Requirement</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}