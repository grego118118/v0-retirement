/**
 * Structured Data Components for AI SEO Optimization
 * Implements Schema.org markup for better AI search engine understanding
 */

import Script from 'next/script'

interface CalculatorStructuredDataProps {
  pageUrl: string
  calculatorType: 'pension' | 'cola' | 'wizard' | 'comparison'
}

export function CalculatorStructuredData({ pageUrl, calculatorType }: CalculatorStructuredDataProps) {
  const getCalculatorSchema = () => {
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Massachusetts Retirement System Calculator",
      "description": "Official calculator for Massachusetts state employee pension benefits with MSRB-validated calculations",
      "url": pageUrl,
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "creator": {
        "@type": "Organization",
        "name": "Massachusetts Retirement Planning Services",
        "description": "Providing accurate retirement calculations for Massachusetts state employees"
      },
      "dateModified": new Date().toISOString(),
      "inLanguage": "en-US"
    }

    switch (calculatorType) {
      case 'pension':
        return {
          ...baseSchema,
          "name": "Massachusetts State Employee Pension Calculator",
          "description": "Calculate pension benefits for Massachusetts state employees Groups 1-4 with official MSRB formulas",
          "featureList": [
            "Pension calculation for Groups 1-4",
            "80% maximum benefit cap application",
            "Retirement option A, B, C comparisons",
            "MSRB-validated benefit factors",
            "Real-time calculation updates"
          ]
        }
      
      case 'cola':
        return {
          ...baseSchema,
          "name": "Massachusetts COLA Calculator",
          "description": "Calculate Cost of Living Adjustments for Massachusetts state employee pensions",
          "featureList": [
            "3% COLA on first $13,000 calculation",
            "Maximum $390 annual increase",
            "Year-by-year COLA projections",
            "Compounding COLA effects",
            "Historical COLA rate analysis"
          ]
        }
      
      case 'wizard':
        return {
          ...baseSchema,
          "name": "Massachusetts Retirement Planning Wizard",
          "description": "Comprehensive retirement planning tool for Massachusetts state employees",
          "featureList": [
            "Step-by-step retirement planning",
            "Pension and Social Security integration",
            "Retirement option optimization",
            "Healthcare cost projections",
            "Income replacement analysis"
          ]
        }
      
      case 'comparison':
        return {
          ...baseSchema,
          "name": "Massachusetts Retirement Options Comparison",
          "description": "Compare retirement options A, B, and C for Massachusetts state employees",
          "featureList": [
            "Side-by-side option comparison",
            "Survivor benefit analysis",
            "Age-based reduction calculations",
            "Long-term financial impact",
            "Decision-making guidance"
          ]
        }
      
      default:
        return baseSchema
    }
  }

  return (
    <Script
      id={`calculator-structured-data-${calculatorType}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(getCalculatorSchema()) }}
    />
  )
}

interface FAQStructuredDataProps {
  faqs: Array<{
    question: string
    answer: string
  }>
}

export function FAQStructuredData({ faqs }: FAQStructuredDataProps) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <Script
      id="faq-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  )
}

interface HowToStructuredDataProps {
  title: string
  description: string
  steps: Array<{
    name: string
    text: string
    url?: string
  }>
}

export function HowToStructuredData({ title, description, steps }: HowToStructuredDataProps) {
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": title,
    "description": description,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      "url": step.url
    }))
  }

  return (
    <Script
      id="howto-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
    />
  )
}

// Pre-defined FAQ data for common retirement questions
export const RETIREMENT_FAQS = [
  {
    question: "How do I calculate my Massachusetts state employee pension?",
    answer: "Use the formula: Average Salary × Years of Service × Benefit Factor. The benefit factor ranges from 2.0% to 2.5% depending on your retirement group (1-4) and age at retirement. The maximum pension is capped at 80% of your average salary."
  },
  {
    question: "What are the different Massachusetts retirement groups?",
    answer: "Group 1: General employees (minimum age 60). Group 2: Certain public safety (minimum age 55). Group 3: State Police (any age with 20+ years). Group 4: Public safety/corrections (minimum age 50). Each group has different benefit factors and retirement ages."
  },
  {
    question: "How does Massachusetts COLA work for retirees?",
    answer: "Massachusetts applies a 3% Cost of Living Adjustment (COLA) annually to the first $13,000 of your pension, with a maximum increase of $390 per year ($32.50 per month). COLA starts the first year after retirement and compounds annually."
  },
  {
    question: "What's the difference between retirement options A, B, and C?",
    answer: "Option A: Full pension, no survivor benefits. Option B: Slightly reduced pension (1% reduction) with return of contributions if you die before receiving equivalent amount. Option C: Reduced pension (7-15% based on ages) with 66.67% survivor benefit to beneficiary."
  },
  {
    question: "When can I retire as a Massachusetts state employee?",
    answer: "Retirement eligibility depends on your group: Group 1 at age 60, Group 2 at age 55, Group 3 any age with 20+ years, Group 4 at age 50. You also need minimum years of service (typically 10-20 years depending on hire date)."
  }
]

// Pre-defined How-To steps for pension calculation
export const PENSION_CALCULATION_STEPS = [
  {
    name: "Determine Your Retirement Group",
    text: "Identify whether you're in Group 1 (general employees), Group 2 (certain public safety), Group 3 (State Police), or Group 4 (public safety/corrections). This determines your benefit factor and minimum retirement age."
  },
  {
    name: "Calculate Your Average Salary",
    text: "Use the average of your highest 3 consecutive years of salary. This is typically your final 3 years of employment for most state employees."
  },
  {
    name: "Determine Your Benefit Factor",
    text: "Find your benefit factor based on your retirement group and age. Factors range from 2.0% to 2.5%. Group 1: 2.0% at 60 to 2.5% at 65. Group 2: 2.0% at 55 to 2.5% at 60."
  },
  {
    name: "Apply the Pension Formula",
    text: "Calculate: Average Salary × Years of Service × Benefit Factor = Annual Pension. For example: $75,000 × 30 years × 2.5% = $56,250 annual pension."
  },
  {
    name: "Apply 80% Maximum Cap",
    text: "Your pension cannot exceed 80% of your average salary. If your calculation exceeds this, your pension is capped at 80% of your average salary."
  },
  {
    name: "Choose Your Retirement Option",
    text: "Select Option A (full pension), Option B (slight reduction with contribution protection), or Option C (reduced pension with survivor benefits). Each option affects your final pension amount."
  }
]
