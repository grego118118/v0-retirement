import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log("Test Prisma endpoint called")
    console.log("Prisma object:", prisma)
    console.log("Prisma object keys:", Object.keys(prisma))
    console.log("Has retirementScenario?", 'retirementScenario' in prisma)
    console.log("Type of retirementScenario:", typeof prisma.retirementScenario)
    
    if (!prisma.retirementScenario) {
      return NextResponse.json({
        error: "retirementScenario model not found on prisma client",
        prismaKeys: Object.keys(prisma),
        hasRetirementScenario: 'retirementScenario' in prisma,
        typeOfRetirementScenario: typeof prisma.retirementScenario
      }, { status: 500 })
    }
    
    // Try to query the database
    const count = await prisma.retirementScenario.count()
    
    return NextResponse.json({
      success: true,
      message: "Prisma client is working",
      scenarioCount: count,
      prismaKeys: Object.keys(prisma),
      hasRetirementScenario: 'retirementScenario' in prisma,
      typeOfRetirementScenario: typeof prisma.retirementScenario
    })
    
  } catch (error) {
    console.error("Test Prisma error:", error)
    return NextResponse.json({
      error: "Test failed",
      details: error instanceof Error ? error.message : String(error),
      prismaKeys: Object.keys(prisma),
      hasRetirementScenario: 'retirementScenario' in prisma,
      typeOfRetirementScenario: typeof prisma.retirementScenario
    }, { status: 500 })
  }
}
