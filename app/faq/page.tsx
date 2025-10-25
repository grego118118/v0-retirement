import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Script from "next/script"
import type { Metadata } from "next"

// AI-optimized metadata for better search engine understanding
export const metadata: Metadata = {
  title: "Massachusetts State Employee Retirement FAQ - Pension Calculator Questions Answered",
  description: "Frequently asked questions about Massachusetts state employee retirement benefits, pension calculations, COLA adjustments, and retirement options A, B, C. Get answers to common MSRB questions with official calculation methods.",
  keywords: "Massachusetts retirement FAQ, state employee pension questions, MSRB calculator help, retirement benefits explained, pension calculation formula, COLA Massachusetts",
  openGraph: {
    title: "Massachusetts Retirement FAQ - Common Pension Questions Answered",
    description: "Get answers to frequently asked questions about Massachusetts state employee retirement benefits, pension calculations, and retirement planning.",
    type: "website"
  }
}

export default function FAQPage() {
  // Structured data for AI search engines
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I calculate my Massachusetts state employee pension?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Use the formula: Average Salary × Years of Service × Benefit Factor. The benefit factor ranges from 2.0% to 2.5% depending on your retirement group (1-4) and age at retirement. The maximum pension is capped at 80% of your average salary."
        }
      },
      {
        "@type": "Question",
        "name": "What are the different Massachusetts retirement groups?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Group 1: General employees (minimum age 60). Group 2: Certain public safety (minimum age 55). Group 3: State Police (any age with 20+ years). Group 4: Public safety/corrections (minimum age 50). Each group has different benefit factors and retirement ages."
        }
      },
      {
        "@type": "Question",
        "name": "How does Massachusetts COLA work for retirees?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Massachusetts applies a 3% Cost of Living Adjustment (COLA) annually to the first $13,000 of your pension, with a maximum increase of $390 per year ($32.50 per month). COLA starts the first year after retirement and compounds annually."
        }
      }
    ]
  }

  return (
    <>
      {/* Structured Data for AI Search Engines */}
      <Script
        id="faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />

      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          {/* AI-optimized header with quick answer */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Massachusetts State Employee Retirement FAQ
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Get answers to frequently asked questions about Massachusetts state employee retirement benefits,
              pension calculations, COLA adjustments, and retirement planning options.
            </p>

            {/* Quick Answer Box for AI */}
            <Card className="bg-blue-50 border-blue-200 mb-8">
              <CardHeader>
                <CardTitle className="text-blue-900">Quick Answer: Pension Calculation Formula</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-800 text-lg font-semibold">
                  Average Salary × Years of Service × Benefit Factor = Annual Pension
                </p>
                <p className="text-blue-700 mt-2">
                  Benefit factors: 2.0%-2.5% based on group and age. Maximum: 80% of salary.
                </p>
              </CardContent>
            </Card>
          </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Questions</CardTitle>
              <CardDescription>Basic information about the pension system</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How is my pension calculated?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Your pension is calculated using the following formula:</p>
                    <p className="mb-2">
                      <strong>
                        Pension = Benefit Factor × Years of Service × Average of Highest 3 Consecutive Years of Regular
                        Compensation
                      </strong>
                    </p>
                    <p>
                      The benefit factor is determined by your age, group classification, and when you entered service.
                      The maximum pension is 80% of your average salary.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-1-5">
                  <AccordionTrigger>Where can I find my salary history for the pension calculation?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-3">
                      Massachusetts state employees can look up their base pay for the past 3 years using the official state payroll system:
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="font-medium mb-2">Massachusetts State Payroll System</p>
                      <a 
                        href="https://cthrupayroll.mass.gov/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                      >
                        Visit cthrupayroll.mass.gov →
                      </a>
                      <p className="text-sm text-muted-foreground mt-2">
                        This official system allows you to access your pay history and find the three highest consecutive years of regular compensation needed for your pension calculation.
                      </p>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      <strong>Remember:</strong> Only include your base salary (regular compensation) and exclude bonuses, overtime, severance pay, and other supplemental payments.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>When am I eligible to retire?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      <strong>For members entering service before April 2, 2012:</strong>
                    </p>
                    <ul className="list-disc list-inside mb-2">
                      <li>20 years of full-time creditable service at any age, OR</li>
                      <li>Attained age 55 with 10 years creditable service.</li>
                    </ul>

                    <p className="mb-2">
                      <strong>For members entering service on and after April 2, 2012:</strong>
                    </p>
                    <ul className="list-disc list-inside">
                      <li>Minimum of 10 years creditable service is required for all groups.</li>
                      <li>Group 1: Minimum 60 years of age.</li>
                      <li>Group 2: Minimum 55 years of age.</li>
                      <li>Group 4: Minimum 50 years of age.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>What are the different employee groups?</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc list-inside">
                      <li>
                        <strong>Group 1:</strong> General employees, including clerical, administrative, and technical
                        workers.
                      </li>
                      <li>
                        <strong>Group 2:</strong> Employees in certain hazardous positions, including certain mental
                        health workers, public works employees, and others.
                      </li>
                      <li>
                        <strong>Group 4:</strong> Public safety officers, including police officers, firefighters, and
                        certain correction officers.
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Retirement Options</CardTitle>
              <CardDescription>Understanding your retirement option choices</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-4">
                  <AccordionTrigger>What are the different retirement options?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Massachusetts offers three retirement options:</p>
                    <ul className="list-disc list-inside">
                      <li>
                        <strong>Option A (Maximum Allowance):</strong> Provides your full retirement allowance. Payments
                        stop upon your death.
                      </li>
                      <li>
                        <strong>Option B (Annuity Protection):</strong> Slightly reduced lifetime allowance (approx.
                        1-5% less). Upon death, beneficiary receives remaining accumulated deductions. Beneficiary can
                        be changed.
                      </li>
                      <li>
                        <strong>Option C (Joint Survivor):</strong> Reduced lifetime allowance (approx. 7-15%+ less).
                        Upon death, your designated beneficiary receives 2/3rds of your allowance for their life. If
                        beneficiary predeceases, allowance "pops up".
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>How do I choose the right retirement option?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Choosing the right retirement option depends on your personal circumstances:</p>
                    <ul className="list-disc list-inside">
                      <li>
                        <strong>Option A</strong> might be appropriate if you have no dependents or if your beneficiary
                        has other sources of income.
                      </li>
                      <li>
                        <strong>Option B</strong> provides some protection for your beneficiary while minimizing the
                        reduction to your allowance.
                      </li>
                      <li>
                        <strong>Option C</strong> provides the most protection for a spouse or dependent who might need
                        ongoing income after your death.
                      </li>
                    </ul>
                    <p className="mt-2">
                      It's recommended to consult with a financial advisor and the State Retirement Board to understand
                      the implications of each option for your specific situation.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>Can I change my retirement option after retirement?</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      No, your retirement option selection is irrevocable once your retirement becomes effective. This
                      is why it's important to carefully consider your options before making a decision.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Credit and Salary</CardTitle>
              <CardDescription>Questions about service credit and salary calculations</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-7">
                  <AccordionTrigger>What counts as "regular compensation"?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Regular compensation generally includes:</p>
                    <ul className="list-disc list-inside mb-2">
                      <li>Base salary</li>
                      <li>Educational incentives</li>
                      <li>Longevity pay</li>
                      <li>Certain differentials</li>
                    </ul>

                    <p className="mb-2">Regular compensation generally does not include:</p>
                    <ul className="list-disc list-inside">
                      <li>Overtime</li>
                      <li>Bonuses</li>
                      <li>Severance pay</li>
                      <li>Early retirement incentives</li>
                      <li>Any payment made as a result of giving notice of retirement</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger>Can I purchase additional service credit?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      Yes, in certain circumstances you may be eligible to purchase additional service credit,
                      including:
                    </p>
                    <ul className="list-disc list-inside">
                      <li>Prior public service in Massachusetts</li>
                      <li>Active military service</li>
                      <li>Approved leaves of absence</li>
                      <li>Out-of-state public teaching service (for teachers)</li>
                    </ul>
                    <p className="mt-2">
                      Contact the State Retirement Board for specific information about your eligibility to purchase
                      service credit and the cost.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-9">
                  <AccordionTrigger>How is my average salary calculated?</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Your pension is based on the average of your highest three consecutive years of regular
                      compensation. For members who entered service on or after April 2, 2012, it's based on the highest
                      five consecutive years. The years do not have to be your final years of employment.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  )
}
