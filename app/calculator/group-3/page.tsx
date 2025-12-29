import { Metadata } from "next"
import { generateSEOMetadata } from "@/components/seo/metadata"
import { BreadcrumbStructuredData, CalculatorStructuredData, FAQStructuredData } from "@/components/seo/structured-data"
import { GroupLandingPage, GroupInfo } from "@/components/calculator/group-landing-page"

export const metadata: Metadata = generateSEOMetadata({
  title: "Group 3 Pension Calculator 2025 | Massachusetts State Police",
  description: "Calculate your Massachusetts State Police Group 3 pension benefits. Free calculator with MSRB formulas. Retire at any age with 20+ years of service. 2.5% flat multiplier.",
  path: "/calculator/group-3",
  keywords: [
    "Massachusetts Group 3 pension calculator",
    "MA State Police pension calculator",
    "Massachusetts State Police retirement",
    "Group 3 retirement benefits",
    "MSRB Group 3 calculator",
    "State Police pension Massachusetts",
    "MSP retirement calculator",
    "Group 3 20 years retirement",
    "Massachusetts trooper pension",
    "State Police benefit multiplier"
  ],
})

const group3Info: GroupInfo = {
  group: "3",
  name: "Group 3 - Massachusetts State Police",
  shortName: "Group 3 - State Police",
  description: "Group 3 is exclusively for Massachusetts State Police members who can retire at any age with 20+ years of service and receive a flat 2.5% benefit multiplier.",
  minAge: 0,
  minService: 20,
  multiplierRange: "2.5%",
  maxBenefit: "80%",
  eligibilityNote: "State Police members can retire at any age with 20 or more years of creditable service. This unique provision recognizes the demanding nature of law enforcement and allows for earlier career transitions.",
  examples: [
    "Massachusetts State Police troopers",
    "MSP sergeants",
    "MSP lieutenants",
    "MSP captains",
    "MSP detectives",
    "State Police command staff"
  ],
  colorClass: "bg-red-100 text-red-800",
  iconBgClass: "bg-red-100 text-red-700"
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
    question: "What is Massachusetts Retirement Group 3?", 
    answer: "Group 3 is exclusively for Massachusetts State Police members. They can retire at any age with 20+ years of service, reflecting the unique demands of state law enforcement." 
  },
  { 
    question: "What is the Group 3 benefit multiplier?", 
    answer: "Group 3 has a flat 2.5% benefit multiplier regardless of retirement age. This is the maximum multiplier available in the Massachusetts retirement system." 
  },
  { 
    question: "When can State Police retire?", 
    answer: "State Police (Group 3) can retire at any age once they have 20 or more years of creditable service. There is no minimum age requirement unlike other groups." 
  },
  { 
    question: "How is Group 3 pension calculated?", 
    answer: "Group 3 pension = Average of highest 3 consecutive years salary × years of service × 2.5%, with an 80% maximum cap. The flat 2.5% multiplier applies regardless of age." 
  }
]

export default function Group3CalculatorPage() {
  return (
    <>
      <CalculatorStructuredData 
        pageUrl="https://www.masspension.com/calculator/group-3"
        calculatorType="pension"
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "https://www.masspension.com" },
          { name: "Calculator", url: "https://www.masspension.com/calculator" },
          { name: "Group 3", url: "https://www.masspension.com/calculator/group-3" },
        ]}
      />
      <FAQStructuredData faqs={faqs} />
      
      <GroupLandingPage 
        groupInfo={group3Info}
        relatedBlogPosts={relatedBlogPosts}
      />
    </>
  )
}

