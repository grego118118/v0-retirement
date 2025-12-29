import { Metadata } from "next"
import { generateSEOMetadata } from "@/components/seo/metadata"
import { BreadcrumbStructuredData, CalculatorStructuredData, FAQStructuredData } from "@/components/seo/structured-data"
import { GroupLandingPage, GroupInfo } from "@/components/calculator/group-landing-page"

export const metadata: Metadata = generateSEOMetadata({
  title: "Group 4 Pension Calculator 2025 | MA Police, Fire & Corrections",
  description: "Calculate your Massachusetts Group 4 pension for police, firefighters, and corrections officers. Free calculator with MSRB formulas. Minimum age 50, up to 2.5% multiplier.",
  path: "/calculator/group-4",
  keywords: [
    "Massachusetts Group 4 pension calculator",
    "MA police pension calculator",
    "Massachusetts firefighter retirement",
    "corrections officer pension MA",
    "Group 4 retirement benefits",
    "MSRB Group 4 calculator",
    "police retirement calculator Massachusetts",
    "firefighter pension calculator MA",
    "Group 4 age 50 retirement",
    "public safety pension Massachusetts"
  ],
})

const group4Info: GroupInfo = {
  group: "4",
  name: "Group 4 - Public Safety & Corrections",
  shortName: "Group 4 - Public Safety",
  description: "Group 4 covers police officers, firefighters, and corrections officers who can retire as early as age 50 with 10+ years of service.",
  minAge: 50,
  minService: 10,
  multiplierRange: "2.0% - 2.5%",
  maxBenefit: "80%",
  eligibilityNote: "Group 4 members can retire at age 50 with at least 10 years of creditable service. The benefit multiplier ranges from 2.0% at age 50 to 2.5% at age 55, providing the earliest full retirement benefits among age-based groups.",
  examples: [
    "Municipal police officers",
    "Firefighters",
    "Corrections officers",
    "Campus police",
    "Transit police",
    "Sheriff's deputies",
    "Fire captains & chiefs"
  ],
  colorClass: "bg-orange-100 text-orange-800",
  iconBgClass: "bg-orange-100 text-orange-700"
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
    question: "What is Massachusetts Retirement Group 4?", 
    answer: "Group 4 includes police officers, firefighters, corrections officers, and other public safety positions. They can retire at age 50 with 10+ years, the earliest age-based retirement in Massachusetts." 
  },
  { 
    question: "What is the Group 4 benefit multiplier?", 
    answer: "Group 4 benefit multipliers range from 2.0% at age 50 to 2.5% at age 55. Retiring at 55 gives you the maximum 2.5% per year of service." 
  },
  { 
    question: "When can police and firefighters retire?", 
    answer: "Police, firefighters, and corrections officers (Group 4) can retire at age 50 with 10+ years of service, or 20+ years at any age under certain provisions." 
  },
  { 
    question: "How is Group 4 pension calculated?", 
    answer: "Group 4 pension = Average of highest 3 consecutive years salary × years of service × benefit factor (2.0%-2.5% based on retirement age), with an 80% maximum cap." 
  }
]

export default function Group4CalculatorPage() {
  return (
    <>
      <CalculatorStructuredData 
        pageUrl="https://www.masspension.com/calculator/group-4"
        calculatorType="pension"
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "https://www.masspension.com" },
          { name: "Calculator", url: "https://www.masspension.com/calculator" },
          { name: "Group 4", url: "https://www.masspension.com/calculator/group-4" },
        ]}
      />
      <FAQStructuredData faqs={faqs} />
      
      <GroupLandingPage 
        groupInfo={group4Info}
        relatedBlogPosts={relatedBlogPosts}
      />
    </>
  )
}

