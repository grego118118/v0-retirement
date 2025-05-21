import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export function AuthDisabledNotice() {
  return (
    <Alert className="mb-6">
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>Authentication Temporarily Disabled</AlertTitle>
      <AlertDescription>
        User accounts and saved calculations are temporarily unavailable while we resolve some technical issues. You can
        still use the calculator, but your results won't be saved.
      </AlertDescription>
    </Alert>
  )
}
