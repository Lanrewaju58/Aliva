import { toast as sonnerToast } from "sonner"

// Create a wrapper to maintain API compatibility if needed
export const toast = ({
  title,
  description,
  variant = "default",
  ...props
}: {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  action?: React.ReactNode
}) => {
  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
      ...props,
    })
  }
  
  return sonnerToast(title, {
    description,
    ...props,
  })
}

// Re-export other toast methods
export const useToast = () => {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  }
}

// Export additional Sonner methods
export { sonnerToast as sonner }