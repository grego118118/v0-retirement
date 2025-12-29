import { Metadata } from "next"
import { generateSEOMetadata } from "@/components/seo/metadata"
import { BreadcrumbStructuredData, CalculatorStructuredData, FAQStructuredData } from "@/components/seo/structured-data"
import { GroupLandingPage, GroupInfo } from "@/components/calculator/group-landing-page"

export const metadata: Metadata = generateSEOMetadata({
  title: "Group 2 Pension Calculator 2025 | MA Probation & Court Officers",
  description: "Calculate your Massachusetts Group 2 pension for probation officers, court officers, and certain public safety positions. Free calculator with MSRB formulas. Minimum age 55.",
  path: "/calculator/group-2",
  keywords: [
    "Massachusetts Group 2 pension calculator",
    "MA probation officer pension",
    "Massachusetts court officer retirement",
    "Group 2 retirement benefits",
    "MSRB Group 2 calculator",
    "MA Group 2 age 55 retirement",
    "probation officer pension Massachusetts",
    "court officer retirement calculator",
    "Group 2 benefit multiplier",
    "Massachusetts public safety pension"
  ],
})

const group2Info: GroupInfo = {
  group: "2",
  name: "Group 2 - Certain Public Safety Positions",
  shortName: "Group 2",
  description: "Group 2 covers probation officers, court officers, and certain public safety positions with enhanced retirement eligibility starting at age 55.",
  minAge: 55,
  minService: 10,
  multiplierRange: "2.0% - 2.5%",
  maxBenefit: "80%",
  eligibilityNote: "Group 2 members can retire at age 55 with at least 10 years of creditable service. The benefit multiplier ranges from 2.0% at age 55 to 2.5% at age 60, providing earlier retirement than Group 1.",
  examples: [
    "Probation officers",
    "Court officers",
    "Parole officers",
    "Certain sheriff's dept. employees",
    "Registry security officers",
    "Environmental police officers"
  ],
  colorClass: "bg-green-100 text-green-800",
  iconBgClass: "bg-green-100 text-green-700"
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
    question: "What is Massachusetts Retirement Group 2?", 
    answer: "Group 2 includes probation officers, court officers, parole officers, and certain public safety positions that don't qualify for Group 4 but require earlier retirement eligibility than Group 1." 
  },
  { 
    question: "What is the Group 2 benefit multiplier?", 
    answer: "Group 2 benefit multipliers range from 2.0% at age 55 to 2.5% at age 60. This allows earlier maximum benefits compared to Group 1's 2.5% at age 65." 
  },
  { 
    question: "When can Group 2 employees retire?", 
    answer: "Group 2 employees can retire at age 55 with 10+ years of service, 5 years earlier than Group 1. This recognizes the demanding nature of these public safety positions." 
  },
  { 
    question: "How is Group 2 pension calculated?", 
    answer: "Group 2 pension = Average of highest 3 consecutive years salary × years of service × benefit factor (2.0%-2.5% based on retirement age), with an 80% maximum cap." 
  }
]

export default function Group2CalculatorPage() {
  return (
    <>
      <CalculatorStructuredData 
        pageUrl="https://www.masspension.com/calculator/group-2"
        calculatorType="pension"
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "https://www.masspension.com" },
          { name: "Calculator", url: "https://www.masspension.com/calculator" },
          { name: "Group 2", url: "https://www.masspension.com/calculator/group-2" },
        ]}
      />
      <FAQStructuredData faqs={faqs} />
      
      <GroupLandingPage 
        groupInfo={group2Info}
        relatedBlogPosts={relatedBlogPosts}
      />
    </>
  )
}

