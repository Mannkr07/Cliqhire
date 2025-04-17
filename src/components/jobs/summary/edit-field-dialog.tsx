import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface EditFieldDialogProps {
  open: boolean
  onClose: () => void
  fieldName: string
  currentValue: string
  onSave: (value: string) => void
  isDate?: boolean
  isTextArea?: boolean
  isSelect?: boolean
  fieldType?: 'text' | 'number' | 'select' | 'date' | 'textarea'
}

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'any', label: 'Any' }
];

const jobTypeOptions = [
  { value: 'full_time', label: 'Full time' },
  { value: 'part_time', label: 'Part time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' }
];

const departmentOptions = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'product', label: 'Product' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'support', label: 'Support' },
  { value: 'hr', label: 'HR' },
  { value: 'finance', label: 'Finance' },
  { value: 'legal', label: 'Legal' },
  { value: 'operations', label: 'Operations' }
];

export function EditFieldDialog({
  open,
  onClose,
  fieldName,
  currentValue,
  onSave,
  isDate,
  isTextArea,
  isSelect,
  fieldType = 'text'
}: EditFieldDialogProps) {
  const [value, setValue] = useState(currentValue)
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    currentValue ? new Date(currentValue) : null
  )

  const getFieldOptions = (fieldName: string) => {
    switch (fieldName.toLowerCase()) {
      case 'gender':
        return genderOptions;
      case 'jobtype':
      case 'job type':
        return jobTypeOptions;
      case 'department':
        return departmentOptions;
      default:
        return [];
    }
  };

  const handleSave = () => {
    if (isDate && selectedDate) {
      onSave(selectedDate.toISOString())
    } else {
      onSave(value)
    }
    onClose()
  }

  const renderField = () => {
    if (isDate) {
      return (
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="MM/dd/yyyy"
          className="w-full p-2 border rounded-md"
          placeholderText="Select date"
        />
      );
    }

    if (isTextArea) {
      return (
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="min-h-[200px]"
          placeholder={`Enter ${fieldName.toLowerCase()}`}
        />
      );
    }

    const options = getFieldOptions(fieldName);
    if (isSelect || options.length > 0) {
      return (
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${fieldName.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        type={fieldType === 'number' ? 'number' : 'text'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={`Enter ${fieldName.toLowerCase()}`}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{value ? 'Edit' : 'Add'} {fieldName}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{fieldName}</Label>
              {renderField()}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}