"use client"

import { Button } from "@/components/ui/button"
import { Plus, Pencil } from "lucide-react"
import { useState } from "react"
import { EditFieldModal } from "./edit-field-modal"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

interface DetailRowProps {
  label: string
  value?: string | Date | null
  onUpdate: (value: string) => void
  optional?: boolean
  isDate?: boolean
}

export function DetailRow({ label, value, onUpdate, optional, isDate }: DetailRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value && typeof value === 'string' ? new Date(value) : value instanceof Date ? value : null
  )

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date)
    if (date) {
      onUpdate(date.toISOString())
    }
    setShowDatePicker(false)
  }

  const displayValue = () => {
    if (!value) return null
    if (value instanceof Date) {
      return value.toLocaleDateString()
    }
    if (typeof value === 'string' && isDate) {
      return new Date(value).toLocaleDateString()
    }
    return value
  }

  return (
    <div className="relative border-b last:border-b-0">
      <div className="flex items-center py-2 ">
        <span className="text-sm text-muted-foreground w-1/3">
          {label}
          {optional && <span className="text-xs ml-1">(optional)</span>}
        </span>
        <div className="flex items-center justify-between flex-1">
          <span className="text-sm">
            {displayValue() || <span className="text-muted-foreground">No Details</span>}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8"
            onClick={() => isDate ? setShowDatePicker(!showDatePicker) : setIsEditing(true)}
          >
            {value ? (
              <>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </>
            )}
          </Button>
        </div>
      </div>

      {isDate && showDatePicker && (
        <div className="absolute z-50 mt-1 bg-white shadow-lg rounded-md">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            inline
            onClickOutside={() => setShowDatePicker(false)}
          />
        </div>
      )}

      {!isDate && (
        <EditFieldModal
          open={isEditing}
          onClose={() => setIsEditing(false)}
          fieldName={label}
          currentValue={value?.toString() || ""}
          onSave={onUpdate}
          isDate={isDate}
        />
      )}
    </div>
  )
}