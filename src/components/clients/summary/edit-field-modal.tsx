"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

interface EditFieldModalProps {
  open: boolean
  onClose: () => void
  fieldName: string
  currentValue?: string
  onSave: (value: string) => void
  isDate?: boolean
}

export function EditFieldModal({ 
  open, 
  onClose, 
  fieldName, 
  currentValue = "", 
  onSave,
  isDate
}: EditFieldModalProps) {
  const [value, setValue] = useState(currentValue)
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    currentValue ? new Date(currentValue) : null
  )

  const handleSave = () => {
    if (isDate && selectedDate) {
      onSave(selectedDate.getFullYear().toString())
    } else {
      onSave(value)
    }
    onClose()
  }

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {fieldName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="value">{fieldName}</Label>
            {isDate ? (
              <div className="relative">
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  showYearPicker
                  dateFormat="yyyy"
                  yearItemNumber={12}
                  className="w-full p-2 border rounded-md"
                  placeholderText="Select Year"
                />
              </div>
            ) : (
              <Input
                id="value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`Enter ${fieldName.toLowerCase()}`}
              />
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}