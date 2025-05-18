"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultChecked?: boolean
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}

const Switch = React.forwardRef<HTMLDivElement, SwitchProps>(
  ({ className, defaultChecked, checked, onCheckedChange, disabled, ...props }, ref) => {
    const [isChecked, setIsChecked] = useState(defaultChecked || false)
    
    const actualChecked = checked !== undefined ? checked : isChecked
    
    const handleClick = () => {
      if (disabled) return
      
      if (checked === undefined) {
        setIsChecked(!isChecked)
      }
      
      onCheckedChange?.(!actualChecked)
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
          actualChecked ? "bg-primary" : "bg-gray-200",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <div
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
            actualChecked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </div>
    )
  }
)

Switch.displayName = "Switch"

export { Switch } 