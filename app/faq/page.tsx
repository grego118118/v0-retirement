import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, Calculator, Users, DollarSign, Calendar, FileText } from "lucide-react"

export const metadata: Metadata = {
  title: "FAQ | MA Pension Estimator",
  description: "Frequently asked questions about Massachusetts state employee retirement benefits, pension calculations, and planning strategies.",
}

const faqCategories = [
  {
    title: "General Questions",
    icon: HelpCircle,
    color: "text-blue-600",
    questions: [
      {
        question: "Who is eligible for Massachusetts state retirement benefits?",
        answer: "Massachusetts state employees, teachers, and certain municipal employees who contribute to the Massachusetts State Retirement System are eligible. You must have at least 10 years of creditable service to be eligible for a retirement allowance."
      },
      {
        question: "What are the different group classifications?",
        answer: "Group 1 includes general employees with a 2% benefit multiplier. Group 2 includes certain hazardous duty positions with a 2.5% multiplier. Group 3 includes state police, municipal police, and firefighters with a 2.5% multiplier and earlier retirement eligibility."
      },
      {
        question: "When can I retire?",
        answer: "Group 1: Age 55 with 10+ years or any age with 30+ years. Group 2: Age 55 with 10+ years or any age with 25+ years. Group 3: Age 55 with 20+ years or any age with 25+ years. Early retirement may be available with reduced benefits."
      }
    ]
  },
  {
    title: "Benefit Calculations",
    icon: Calculator,
    color: "text-green-600",
    questions: [
      {
        question: "How is my pension benefit calculated?",
        answer: "Your annual benefit = Years of Service × Benefit Multiplier × Average of your highest 3 consecutive years of salary. The multiplier is 2% for Group 1 and 2.5% for Groups 2 and 3."
      },
      {
        question: "What is the maximum benefit I can receive?",
        answer: "The maximum benefit is 80% of your highest average salary. This typically requires 40 years of service for Group 1 or 32 years for Groups 2 and 3."
      },
      {
        question: "How do COLA adjustments work?",
        answer: "Cost of Living Adjustments (COLA) provide a 3% increase on the first $13,000 of your annual retirement allowance, with a maximum increase of $390 per year. COLA is subject to annual legislative approval."
      }
    ]
  },
  {
    title: "Social Security Integration",
    icon: DollarSign,
    color: "text-purple-600",
    questions: [
      {
        question: "Can I collect both my MA pension and Social Security?",
        answer: "Yes, Massachusetts state employees can collect both their state pension and Social Security benefits. There is no offset or reduction between the two benefits."
      },
      {
        question: "When should I claim Social Security benefits?",
        answer: "You can claim as early as age 62 with reduced benefits, or wait until full retirement age (66-67) for full benefits. Delaying until age 70 provides delayed retirement credits for maximum benefits."
      },
      {
        question: "How are Social Security benefits taxed in Massachusetts?",
        answer: "Massachusetts does not tax Social Security benefits. However, federal taxes may apply depending on your total income level."
      }
    ]
  },
  {
    title: "Planning & Strategy",
    icon: Calendar,
    color: "text-orange-600",
    questions: [
      {
        question: "Should I retire as soon as I'm eligible?",
        answer: "This depends on your financial goals, health, and personal circumstances. Consider factors like benefit amounts, healthcare coverage, other income sources, and your desired lifestyle in retirement."
      },
      {
        question: "What happens to my benefits if I die before retirement?",
        answer: "If you have at least 2 years of service, your beneficiary may be eligible for a death benefit. The amount depends on your years of service and salary. You can also elect survivor benefits that provide ongoing payments to your spouse."
      },
      {
        question: "Can I work after retirement and still collect my pension?",
        answer: "Yes, but there are restrictions. You cannot work for a Massachusetts public employer in the same capacity for 180 days after retirement. After that, you may work with some limitations on hours and earnings."
      }
    ]
  },
  {
    title: "Application Process",
    icon: FileText,
    color: "text-red-600",
    questions: [
      {
        question: "When should I apply for retirement?",
        answer: "Submit your retirement application at least 90 days before your intended retirement date. This allows time for processing and ensures your first payment arrives on schedule."
      },
      {
        question: "What documents do I need to retire?",
        answer: "You'll need your retirement application, birth certificate, marriage certificate (if applicable), beneficiary designation forms, and any military service documentation if you're purchasing military time."
      },
      {
        question: "How long does the retirement process take?",
        answer: "The typical processing time is 60-90 days from receipt of your complete application. Complex cases or missing documentation may take longer."
      }
    ]
  }
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white py-16 md:py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent"></div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
              Frequently Asked
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Questions
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
              Find answers to common questions about Massachusetts state employee retirement
              benefits, <strong>pension calculations</strong>, and planning strategies.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">

        {/* FAQ Categories */}
        <div className="space-y-8 lg:space-y-12">
          {faqCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50">
              <CardHeader className="pb-4 lg:pb-6 xl:pb-8 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
                <CardTitle className="flex items-center gap-3 lg:gap-4 text-lg lg:text-xl xl:text-2xl">
                  <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 shadow-md">
                    <category.icon className={`h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 ${category.color}`} />
                  </div>
                  {category.title}
                </CardTitle>
                <CardDescription className="text-sm lg:text-base xl:text-lg">
                  Common questions about {category.title.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, questionIndex) => (
                    <AccordionItem key={questionIndex} value={`${categoryIndex}-${questionIndex}`}>
                      <AccordionTrigger className="text-left text-sm lg:text-base xl:text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm lg:text-base xl:text-lg leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="mt-12 border-0 shadow-lg bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
          <CardHeader className="text-center pb-4 lg:pb-6 xl:pb-8 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
            <CardTitle className="text-xl lg:text-2xl xl:text-3xl text-slate-800 dark:text-slate-200">Still Have Questions?</CardTitle>
            <CardDescription className="text-sm lg:text-base xl:text-lg">
              Can't find what you're looking for? We're here to help.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4 lg:space-y-6 px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
            <p className="text-sm lg:text-base xl:text-lg text-muted-foreground">
              For specific questions about your benefits, contact the Massachusetts State Retirement Board:
            </p>
            <div className="space-y-2 lg:space-y-3">
              <p className="text-sm lg:text-base xl:text-lg"><strong>Phone:</strong> (617) 367-7770</p>
              <p className="text-sm lg:text-base xl:text-lg"><strong>Hours:</strong> Monday-Friday, 8:30 AM - 5:00 PM</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
