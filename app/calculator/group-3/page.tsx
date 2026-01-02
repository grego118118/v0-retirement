import { Metadata } from "next"
import { generateSEOMetadata } from "@/components/seo/metadata"
import { BreadcrumbStructuredData, CalculatorStructuredData, FAQStructuredData } from "@/components/seo/structured-data"
import { GroupLandingPage, GroupInfo } from "@/components/calculator/group-landing-page"

export const metadata: Metadata = generateSEOMetadata({
  title: "Group 3 Pension Calculator 2025 | Massachusetts State Police ONLY",
  description: "Calculate your Massachusetts State Police Group 3 pension benefits. EXCLUSIVE to MSP members. Retire at ANY age with 20+ years of service. Flat 2.5% multiplier - highest in MA system.",
  path: "/calculator/group-3",
  keywords: [
    "Massachusetts Group 3 pension calculator",
    "MA State Police pension calculator",
    "Massachusetts State Police retirement",
    "Group 3 retirement benefits MSP only",
    "MSRB Group 3 calculator",
    "State Police pension Massachusetts",
    "MSP retirement calculator",
    "Group 3 any age retirement",
    "Massachusetts trooper pension",
    "State Police 2.5% multiplier",
    "MSP exclusive retirement benefits"
  ],
})

const group3Info: GroupInfo = {
  group: "3",
  name: "Group 3 - Massachusetts State Police ONLY",
  shortName: "MSP Exclusive",
  description: "Group 3 is EXCLUSIVELY for Massachusetts State Police members. Unlike other law enforcement (municipal police, sheriff's deputies, etc.), MSP members can retire at ANY age with 20+ years of service and receive a flat 2.5% multiplier—the maximum available in the MA retirement system.",
  minAge: 0,
  minService: 20,
  multiplierRange: "2.5% (flat)",
  maxBenefit: "80%",
  eligibilityNote: "IMPORTANT: Group 3 is ONLY for Massachusetts State Police. Municipal police, sheriff's deputies, campus police, and other law enforcement are NOT in Group 3—they are in Group 4. MSP members can retire at ANY age (no minimum) once they have 20+ years of creditable service, recognizing the unique demands of state-level law enforcement.",
  examples: [
    "Massachusetts State Police Troopers",
    "MSP Detective Lieutenants",
    "MSP Sergeants & Corporals",
    "MSP Station Commanders",
    "State Police Crime Lab personnel",
    "MSP Command Staff (Captains, Majors, Lt. Colonels)"
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
    answer: "Group 3 is EXCLUSIVELY for Massachusetts State Police (MSP) members. It does NOT include municipal police, sheriff's deputies, campus police, or MBTA police—those positions are in Group 4. MSP members receive unique benefits including any-age retirement with 20+ years of service."
  },
  {
    question: "What is the Group 3 benefit multiplier?",
    answer: "Group 3 has a flat 2.5% benefit multiplier regardless of retirement age. This is the MAXIMUM multiplier available in the entire Massachusetts retirement system. Other groups must reach certain ages to achieve 2.5%, but MSP members get it at any age."
  },
  {
    question: "When can State Police retire?",
    answer: "Massachusetts State Police (Group 3) can retire at ANY age once they have 20 or more years of creditable service. There is NO minimum age requirement—unlike Group 4 (min age 50), Group 2 (min age 55), or Group 1 (min age 60). This recognizes the demanding nature of state law enforcement work."
  },
  {
    question: "How is Group 3 pension calculated?",
    answer: "Group 3 pension = Average of highest 3 consecutive years salary × years of service × 2.5%, with an 80% maximum cap. The flat 2.5% multiplier applies regardless of your retirement age—a 42-year-old trooper with 20 years gets the same 2.5% as a 55-year-old."
  },
  {
    question: "I'm a municipal police officer—am I in Group 3?",
    answer: "No. Municipal police, town police, sheriff's deputies, campus police, MBTA police, and other law enforcement are in Group 4, not Group 3. Group 3 is EXCLUSIVELY for Massachusetts State Police members. Group 4 has a minimum retirement age of 50 with 10+ years of service."
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

