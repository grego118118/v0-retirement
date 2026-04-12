import type { Metadata } from "next"
import ContactForm from "@/components/contact-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, Clock, ExternalLink } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Support | Massachusetts Pension Estimator",
  description: "Get help with the Massachusetts Pension Estimator or ask questions about your state pension benefits.",
}

export default function ContactPage() {
  return (
    <div className="container py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Contact Support</h1>
        <p className="text-muted-foreground mb-8 max-w-3xl">
          Have questions about using the pension estimator or need assistance with your retirement planning? We're here
          to help.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>Phone Support</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  For immediate assistance with the pension estimator:
                </p>
                <p className="font-medium">(617) 555-1234</p>
                <div className="mt-3 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Monday - Friday
                  </p>
                  <p>8:30 AM - 5:00 PM EST</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>Email Support</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">For general inquiries or technical issues:</p>
                <a href="mailto:support@mapensionestimator.gov" className="font-medium text-primary hover:underline">
                  support@mapensionestimator.gov
                </a>
                <p className="mt-3 text-xs text-muted-foreground">
                  We aim to respond to all emails within 1-2 business days.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-primary" />
                  <span>Official Resources</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Massachusetts State Retirement Board</p>
                  <a
                    href="https://www.mass.gov/orgs/massachusetts-state-retirement-board"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    Visit website <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div>
                  <p className="text-sm font-medium">State Retiree Benefits</p>
                  <a
                    href="https://www.mass.gov/topics/retiree-benefits"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    Visit website <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div>
                  <p className="text-sm font-medium">Retirement Planning Resources</p>
                  <a
                    href="https://www.mass.gov/info-details/retirement-planning-resources"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    Visit website <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 bg-muted/30 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Support Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">How accurate is the pension estimator?</h3>
              <p className="text-sm text-muted-foreground">
                The estimator uses the same formulas as the official Massachusetts retirement system, but your actual
                pension will be determined by the State Retirement Board based on verified information. This tool is for
                planning purposes only.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Is my data secure?</h3>
              <p className="text-sm text-muted-foreground">
                All data is stored locally on your device and is not transmitted to any server. You can clear your saved
                data at any time using the clear button in the calculator.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">How do I get an official pension estimate?</h3>
              <p className="text-sm text-muted-foreground">
                Contact the Massachusetts State Retirement Board directly to request an official pension estimate. They
                will need your personal information and employment history to provide an accurate calculation.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">What if I find a discrepancy in my calculation?</h3>
              <p className="text-sm text-muted-foreground">
                If you believe there's an error in the calculation, please contact us with details about the inputs you
                used and the expected results. We're committed to providing accurate estimates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
