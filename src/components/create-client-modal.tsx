"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload } from "lucide-react"
import { createClient } from "@/services/clientService"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import axios from "axios"
import * as Flags from 'country-flag-icons/react/3x2'
import React from "react"
import { INDUSTRIES } from "@/lib/constants"

interface CreateClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ClientForm {
  name: string
  email: string
  phoneNumber: string
  website: string
  industry: string
  location: string
  address: string
  googleMapsLink: string
  incorporationDate: string
  countryOfRegistration: string
  registrationNumber: string
  lineOfBusiness: string[]
  countryOfBusiness: string
  referredBy: string
  linkedInProfile: string
  linkedInPage: string
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
}

export function CreateClientModal({ open, onOpenChange }: CreateClientModalProps) {
  const [formData, setFormData] = useState<ClientForm>({
    name: "",
    email: "",
    phoneNumber: "",
    website: "",
    industry: "",
    location: "",
    address: "",
    googleMapsLink: "",
    incorporationDate: "",
    countryOfRegistration: "",
    registrationNumber: "",
    lineOfBusiness: [],
    countryOfBusiness: "",
    referredBy: "",
    linkedInProfile: "",
    linkedInPage: "",
  })

  const [selectedYear, setSelectedYear] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [countrySuggestions, setCountrySuggestions] = useState<CountrySuggestion[]>([])
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false)
  
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({
    profileImage: null,
    crCopy: null,
    vatCopy: null,
    gstTinDocument: null,
  })

  // Location suggestions
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

  // Country suggestions
  useEffect(() => {
    const fetchCountrySuggestions = async () => {
      if (formData.countryOfRegistration.length < 2) {
        setCountrySuggestions([])
        return
      }

      try {
        const response = await axios.get(
          `https://restcountries.com/v3.1/name/${encodeURIComponent(formData.countryOfRegistration)}`
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
  }, [formData.countryOfRegistration])

  const handleLocationSelect = async (suggestion: LocationSuggestion) => {
    setFormData(prev => ({
      ...prev,
      location: suggestion.display_name,
    }))
    setShowLocationSuggestions(false)

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${suggestion.lat}&lon=${suggestion.lon}`
      )
      const addressData = response.data.address
      
      setFormData(prev => ({
        ...prev,
        countryOfBusiness: addressData.country || prev.countryOfBusiness
      }))
    } catch (error) {
      console.error("Error fetching address details:", error)
    }
  }

  const handleCountrySelect = (countryName: string) => {
    setFormData(prev => ({
      ...prev,
      countryOfRegistration: countryName
    }))
    setShowCountrySuggestions(false)
  }

  const handleInputChange = (field: keyof ClientForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = e.target.value;
    
    // If it's the website field and doesn't start with http:// or https://, add https://
    if (field === 'website' && value && !value.match(/^https?:\/\//)) {
      value = `https://${value}`;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (field === 'location') {
      setShowLocationSuggestions(true)
    }
    if (field === 'countryOfRegistration') {
      setShowCountrySuggestions(true)
    }
    setError(null)
  }

  const handleFileChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setError(`File ${file.name} is too large. Maximum size is 5MB.`)
        return
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        setError(`Invalid file type. Allowed types are: JPEG, PNG, PDF`)
        return
      }

      setUploadedFiles((prev) => ({
        ...prev,
        [field]: file,
      }))
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formDataToSend = new FormData()

      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, value)
        }
      })

      Object.entries(uploadedFiles).forEach(([key, file]) => {
        if (file) {
          formDataToSend.append(key, file, file.name)
        }
      })

      const result = await createClient(formDataToSend)
      console.log("Client created successfully:", result)
      
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        website: "",
        industry: "",
        location: "",
        address: "",
        googleMapsLink: "",
        incorporationDate: "",
        countryOfRegistration: "",
        registrationNumber: "",
        lineOfBusiness: [],
        countryOfBusiness: "",
        referredBy: "",
        linkedInProfile: "",
        linkedInPage: "",
      })
      
      setUploadedFiles({
        profileImage: null,
        crCopy: null,
        vatCopy: null,
        gstTinDocument: null,
      })
      
      onOpenChange(false)
    } catch (error: any) {
      console.error("Failed to create client:", error)
      setError(error.message || 'Failed to create client. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Client</DialogTitle>
          <DialogDescription>
            Fill in the client details below. Required fields are marked with an asterisk (*).
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label>Client Profile Image</Label>
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50"
                onClick={() => document.getElementById("profileImageInput")?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
              </div>
              <input
                id="profileImageInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange("profileImage")}
              />
              {uploadedFiles.profileImage && (
                <p className="text-sm mt-2">Selected file: {uploadedFiles.profileImage.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange("name")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Client Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange("email")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange("phoneNumber")}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Client Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange("website")}
                placeholder="www.example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Client Industry *</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {Object.entries(INDUSTRIES).map(([category, industries]) => (
                    <SelectGroup key={category}>
                      <SelectLabel className="font-semibold">{category}</SelectLabel>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Client Location *</Label>
              <div className="relative">
                <Input
                  id="location"
                  value={formData.location}
                  onChange={handleInputChange("location")}
                  required
                  placeholder="Search for location"
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

            <div className="space-y-2">
              <Label htmlFor="address">Client Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={handleInputChange("address")}
                placeholder="Enter detailed address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleMapsLink">Google Maps Link</Label>
              <Input
                id="googleMapsLink"
                value={formData.googleMapsLink}
                onChange={handleInputChange("googleMapsLink")}
                placeholder="Enter Google Maps link"
              />
            </div>

            <div className="space-y-2 flex flex-col">
              <Label htmlFor="incorporationDate">Client Incorporation Date</Label>
              <DatePicker
                selected={selectedYear}
                onChange={(date) => setSelectedYear(date)}
                showYearPicker
                dateFormat="yyyy"
                className="w-full p-2 border rounded-md"
                placeholderText="Select Year"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="countryOfRegistration">Country of Registration *</Label>
              <div className="relative">
                <Input
                  id="countryOfRegistration"
                  value={formData.countryOfRegistration}
                  onChange={handleInputChange("countryOfRegistration")}
                  required
                  placeholder="Search for country"
                />
                {showCountrySuggestions && countrySuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {countrySuggestions.map((country, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleCountrySelect(country.name.common)}
                      >
                        {country.name.common}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleInputChange("registrationNumber")}
              />
            </div>

            <div className="space-y-2">
  <Label htmlFor="lineOfBusiness">Line of Business *</Label>
  <div className="space-y-2 border rounded-md p-2">
    {["recruitment", "hr-consulting", "business-development", "learning-development"].map((option) => (
      <div key={option} className="flex items-center space-x-2">
        <Checkbox
          id={`lob-${option}`}
          checked={formData.lineOfBusiness?.includes(option)}
          onCheckedChange={(checked) => {
            setFormData(prev => {
              const current = prev.lineOfBusiness || [];
              return {
                ...prev,
                lineOfBusiness: checked
                  ? [...current, option]
                  : current.filter(item => item !== option)
              };
            });
          }}
        />
        <label htmlFor={`lob-${option}`} className="text-sm font-medium leading-none">
          {option.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </label>
      </div>
    ))} 
  </div>
</div>

            <div className="space-y-2">
              <Label htmlFor="countryOfBusiness">Country of Business *</Label>
              <Input
                id="countryOfBusiness"
                value={formData.countryOfBusiness}
                onChange={handleInputChange("countryOfBusiness")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referredBy">Referred By</Label>
              <Input
                id="referredBy"
                value={formData.referredBy}
                onChange={handleInputChange("referredBy")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedInProfile">LinkedIn Profile</Label>
              <Input
                id="linkedInProfile"
                value={formData.linkedInProfile}
                onChange={handleInputChange("linkedInProfile")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedInPage">Client LinkedIn Page</Label>
              <Input
                id="linkedInPage"
                value={formData.linkedInPage}
                onChange={handleInputChange("linkedInPage")}
              />
            </div>

            <div className="space-y-2">
              <Label>CR Copy</Label>
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50"
                onClick={() => document.getElementById("crCopyInput")?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Upload CR Copy</p>
              </div>
              <input
                id="crCopyInput"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange("crCopy")}
              />
              {uploadedFiles.crCopy && (
                <p className="text-sm mt-2">Selected file: {uploadedFiles.crCopy.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>VAT Copy</Label>
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50"
                onClick={() => document.getElementById("vatCopyInput")?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Upload VAT Copy</p>
              </div>
              <input
                id="vatCopyInput"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange("vatCopy")}
              />
              {uploadedFiles.vatCopy && (
                <p className="text-sm mt-2">Selected file: {uploadedFiles.vatCopy.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>GST/TIN Document</Label>
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50"
                onClick={() => document.getElementById("gstTinDocumentInput")?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Upload GST/TIN Document</p>
              </div>
              <input
                id="gstTinDocumentInput"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange("gstTinDocument")}
              />
              {uploadedFiles.gstTinDocument && (
                <p className="text-sm mt-2">Selected file: {uploadedFiles.gstTinDocument.name}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}