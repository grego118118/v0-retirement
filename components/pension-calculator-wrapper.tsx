"use client"

import PensionCalculator from "@/components/pension-calculator"
import { useSearchParams } from "next/navigation"

export default function PensionCalculatorWrapper() {
  // This component can safely use useSearchParams() since it's a client component
  const searchParams = useSearchParams()

  return <PensionCalculator />
}
