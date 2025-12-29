import { Metadata } from "next"
import { generateSEOMetadata } from "@/components/seo/metadata"
import { BreadcrumbStructuredData, CalculatorStructuredData, FAQStructuredData } from "@/components/seo/structured-data"
import { GroupLandingPage, GroupInfo } from "@/components/calculator/group-landing-page"

export const metadata: Metadata = generateSEOMetadata({
  title: "Group 1 Pension Calculator 2025 | MA General Employees & Teachers",
  description: "Calculate your Massachusetts Group 1 pension benefits for general employees, teachers, and clerical workers. Free calculator with official MSRB formulas. Minimum age 60, up to 2.5% multiplier.",
  path: "/calculator/group-1",
  keywords: [
    "Massachusetts Group 1 pension calculator",
    "MA teacher pension calculator",
    "Massachusetts state employee retirement calculator",
    "Group 1 retirement benefits",
    "Massachusetts general employee pension",
    "MSRB Group 1 calculator",
    "MA state worker retirement",
    "Massachusetts clerical pension",
    "Group 1 benefit multiplier",
    "MA pension age 60 retirement"
  ],
})

const group1Info: GroupInfo = {
  group: "1",
  name: "Group 1 - General Employees",
  shortName: "Group 1",
  description: "Group 1 includes general employees, teachers, clerical workers, and most state workers. If you're not in a hazardous duty position, you're likely in Group 1.",
  minAge: 60,
  minService: 10,
  multiplierRange: "2.0% - 2.5%",
  maxBenefit: "80%",
  eligibilityNote: "Group 1 members can retire at age 60 with at least 10 years of creditable service, or at age 65 with any amount of service. The benefit multiplier ranges from 2.0% at age 60 to 2.5% at age 65.",
  examples: [
    "Teachers",
    "Administrative staff",
    "Clerical workers",
    "IT professionals",
    "Social workers",
    "Librarians",
    "Most state office workers"
  ],
  colorClass: "bg-blue-100 text-blue-800",
  iconBgClass: "bg-blue-100 text-blue-700"
}

const relatedBlogPosts = [
  {
    href: "/blog/massachusetts-retirement-groups-1-4-complete-guide",
    title: "Complete Guide to MA Retirement Groups",
    description: "Understand the differences between Groups 1-4 and find your classification",
    badge: "Groups"
  },
  {
    href: "/blog/understanding-massachusetts-pension-options",
    title: "Pension Options A, B, C Explained",
    description: "Compare survivor benefits and choose the right option for you",
    badge: "Options"
  },
  {
    href: "/blog/massachusetts-cola-2026-complete-guide",
    title: "COLA 2026 Guide",
    description: "How the 3% COLA on first $13,000 affects your pension",
    badge: "COLA"
  }
]

const faqs = [
  { 
    question: "What is Massachusetts Retirement Group 1?", 
    answer: "Group 1 includes general employees such as teachers, clerical workers, administrative staff, and most state workers not in hazardous duty positions. Minimum retirement age is 60 with 10 years of service." 
  },
  { 
    question: "What is the Group 1 benefit multiplier?", 
    answer: "Group 1 benefit multipliers range from 2.0% at age 60 to 2.5% at age 65. Your annual pension equals your average salary × years of service × the multiplier, capped at 80% of salary." 
  },
  { 
    question: "When can Group 1 employees retire?", 
    answer: "Group 1 employees can retire at age 60 with 10+ years of service, or at age 65 with any amount of creditable service. Early retirement with reduced benefits is not available for Group 1." 
  },
  { 
    question: "How is Group 1 pension calculated?", 
    answer: "Group 1 pension = Average of highest 3 consecutive years salary × years of service × benefit factor (2.0%-2.5% based on retirement age), with an 80% maximum cap." 
  }
]

export default function Group1CalculatorPage() {
  return (
    <>
      <CalculatorStructuredData 
        pageUrl="https://www.masspension.com/calculator/group-1"
        calculatorType="pension"
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "https://www.masspension.com" },
          { name: "Calculator", url: "https://www.masspension.com/calculator" },
          { name: "Group 1", url: "https://www.masspension.com/calculator/group-1" },
        ]}
      />
      <FAQStructuredData faqs={faqs} />
      
      <GroupLandingPage 
        groupInfo={group1Info}
        relatedBlogPosts={relatedBlogPosts}
      />
    </>
  )
}

