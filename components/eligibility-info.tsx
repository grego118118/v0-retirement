import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function EligibilityInfo() {
  return (
    <div className="mb-8">
      <Alert className="mb-4 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/30">
        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-400">Important Information</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          Eligibility to receive any actual retirement benefit and the amount of a benefit is subject to verification of
          age, membership status, creditable service, "regular compensation" amounts, group classification, and
          statutory (anti-spiking) limits.
        </AlertDescription>
      </Alert>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="contact">
          <AccordionTrigger className="text-sm font-medium">Contact the State Retirement Board if:</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
              <li>
                In the five years of creditable service immediately preceding retirement your annual rate of salary
                doubled between any two consecutive years, OR
              </li>
              <li>
                In determining the 3-year or 5-year salary average your regular compensation in any year exceeds the
                average of the regular compensation of the previous two years by more than 10%.
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="before-2012">
          <AccordionTrigger className="text-sm font-medium">
            For members entering service <span className="text-blue-600 dark:text-blue-400">before April 2, 2012</span>:
          </AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
              <li>20 years of full-time creditable service at any age, OR</li>
              <li>Attained age 55 with 10 years creditable service.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="after-2012">
          <AccordionTrigger className="text-sm font-medium">
            For members entering service{" "}
            <span className="text-blue-600 dark:text-blue-400">on and after April 2, 2012</span>:
          </AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
              <li>Minimum of 10 years creditable service is required for all groups.</li>
              <li>Group 1: Minimum 60 years of age.</li>
              <li>Group 2: Minimum 55 years of age.</li>
              <li>Group 4: Minimum 50 years of age.</li>
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              Note: The percentage chart for members hired on or after April 2, 2012 with less than 30 years of service
              will be applied if applicable.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
