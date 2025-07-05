import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-config"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Fetch calculations using Prisma
    const calculations = await prisma.retirementCalculation.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to include parsed socialSecurityData
    const transformedCalculations = calculations.map(calc => ({
      ...calc,
      socialSecurityData: calc.socialSecurityData ? JSON.parse(calc.socialSecurityData) : null
    }))

    return NextResponse.json(transformedCalculations)
  } catch (error) {
    console.error("Error fetching calculations:", error)
    return NextResponse.json({ message: "Failed to fetch calculations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Create calculation using Prisma
    const calculation = await prisma.retirementCalculation.create({
      data: {
        userId: session.user.id,
        calculationName: data.calculationName || `Calculation ${new Date().toLocaleDateString()}`,
        retirementDate: new Date(data.retirementDate),
        retirementAge: data.retirementAge,
        yearsOfService: data.yearsOfService,
        averageSalary: data.averageSalary,
        retirementGroup: data.retirementGroup,
        benefitPercentage: data.benefitPercentage,
        retirementOption: data.retirementOption,
        monthlyBenefit: data.monthlyBenefit,
        annualBenefit: data.annualBenefit,
        benefitReduction: data.benefitReduction,
        survivorBenefit: data.survivorBenefit,
        notes: data.notes,
        isFavorite: data.isFavorite || false,
        socialSecurityData: data.socialSecurityData ? JSON.stringify(data.socialSecurityData) : null,
      }
    })

    // Transform the response to include parsed socialSecurityData
    const responseCalculation = {
      ...calculation,
      socialSecurityData: calculation.socialSecurityData ? JSON.parse(calculation.socialSecurityData) : null,
    }

    return NextResponse.json({ id: calculation.id, calculation: responseCalculation, success: true })
  } catch (error) {
    console.error("Error saving calculation:", error)
    return NextResponse.json({ message: "Failed to save calculation" }, { status: 500 })
  }
}
