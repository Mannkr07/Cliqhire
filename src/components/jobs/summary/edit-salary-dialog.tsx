import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as Flags from 'country-flag-icons/react/3x2'
import React from "react"

interface EditSalaryDialogProps {
  open: boolean
  onClose: () => void
  currentValues: {
    minSalary: number;
    maxSalary: number;
    currency: string;
  }
  onSave: (values: { minSalary: number; maxSalary: number; currency: string }) => void
}

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
];

export function EditSalaryDialog({
  open,
  onClose,
  currentValues,
  onSave
}: EditSalaryDialogProps) {
  const [values, setValues] = useState(currentValues)

  const handleSave = () => {
    onSave(values)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Salary Range</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={values.currency}
                onValueChange={(value) => setValues(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {values.currency && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-3">
                          {currencies.find(c => c.code === values.currency)?.flag && (
                            // @ts-ignore
                            React.createElement(Flags[currencies.find(c => c.code === values.currency)?.flag || ''])
                          )}
                        </div>
                        <span>{values.currency}</span>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Salary</Label>
                <Input
                  type="number"
                  value={values.minSalary}
                  onChange={(e) => setValues(prev => ({ ...prev, minSalary: Number(e.target.value) }))}
                  placeholder="Enter minimum salary"
                />
              </div>

              <div className="space-y-2">
                <Label>Maximum Salary</Label>
                <Input
                  type="number"
                  value={values.maxSalary}
                  onChange={(e) => setValues(prev => ({ ...prev, maxSalary: Number(e.target.value) }))}
                  placeholder="Enter maximum salary"
                />
              </div>
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