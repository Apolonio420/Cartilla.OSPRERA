import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep: number
}

export function Steps({ currentStep, className, ...props }: StepsProps) {
  const childrenArray = React.Children.toArray(props.children)
  const steps = childrenArray.map((step, index) => {
    if (React.isValidElement(step)) {
      return React.cloneElement(step, {
        ...step.props,
        stepNumber: index,
        isActive: currentStep === index,
        isCompleted: currentStep > index,
      })
    }
    return step
  })

  return (
    <div className={cn("flex items-center justify-between", className)} {...props}>
      {steps}
    </div>
  )
}

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  stepNumber?: number
  isActive?: boolean
  isCompleted?: boolean
}

export function Step({ title, stepNumber, isActive, isCompleted, className, ...props }: StepProps) {
  return (
    <div className={cn("flex flex-1 flex-col items-center justify-center", className)} {...props}>
      <div className="flex items-center justify-center">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium",
            isActive
              ? "border-[#00613c] bg-[#00613c] text-white"
              : isCompleted
                ? "border-[#00613c] bg-[#00613c] text-white"
                : "border-gray-300 text-gray-500",
          )}
        >
          {isCompleted ? <CheckIcon className="h-4 w-4" /> : stepNumber! + 1}
        </div>
        {stepNumber! < React.Children.count(props.children) - 1 && (
          <div className={cn("h-0.5 w-full flex-1", isCompleted ? "bg-[#00613c]" : "bg-gray-300")} />
        )}
      </div>
      <div
        className={cn(
          "mt-2 text-center text-sm font-medium",
          isActive || isCompleted ? "text-[#00613c]" : "text-gray-500",
        )}
      >
        {title}
      </div>
    </div>
  )
}
