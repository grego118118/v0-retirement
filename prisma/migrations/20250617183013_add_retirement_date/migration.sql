/*
  Warnings:

  - You are about to drop the column `filename` on the `PdfGeneration` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `PdfGeneration` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `PdfGeneration` table. All the data in the column will be lost.
  - Added the required column `generationTime` to the `PdfGeneration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pdfType` to the `PdfGeneration` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "ActionItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "triggerCondition" TEXT,
    "targetGroup" TEXT,
    "targetAgeRange" TEXT,
    "targetServiceRange" TEXT,
    "actionType" TEXT NOT NULL,
    "actionUrl" TEXT,
    "actionData" TEXT,
    "completedAt" DATETIME,
    "dismissedAt" DATETIME,
    "dismissalReason" TEXT,
    "relatedCalculationId" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" DATETIME,
    "isSystemGenerated" BOOLEAN NOT NULL DEFAULT true,
    "generationReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ActionItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ActionItem_relatedCalculationId_fkey" FOREIGN KEY ("relatedCalculationId") REFERENCES "RetirementCalculation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RetirementScenario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isBaseline" BOOLEAN NOT NULL DEFAULT false,
    "personalParameters" TEXT NOT NULL,
    "pensionParameters" TEXT NOT NULL,
    "socialSecurityParameters" TEXT NOT NULL,
    "financialParameters" TEXT NOT NULL,
    "taxParameters" TEXT NOT NULL,
    "colaParameters" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RetirementScenario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScenarioResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scenarioId" TEXT NOT NULL,
    "pensionMonthlyBenefit" REAL NOT NULL,
    "pensionAnnualBenefit" REAL NOT NULL,
    "pensionLifetimeBenefits" REAL NOT NULL,
    "pensionBenefitReduction" REAL NOT NULL DEFAULT 0,
    "pensionSurvivorBenefit" REAL,
    "ssMonthlyBenefit" REAL NOT NULL,
    "ssAnnualBenefit" REAL NOT NULL,
    "ssLifetimeBenefits" REAL NOT NULL,
    "ssSpousalBenefit" REAL,
    "ssSurvivorBenefit" REAL,
    "totalMonthlyIncome" REAL NOT NULL,
    "totalAnnualIncome" REAL NOT NULL,
    "netAfterTaxIncome" REAL NOT NULL,
    "replacementRatio" REAL NOT NULL,
    "annualTaxBurden" REAL NOT NULL,
    "effectiveTaxRate" REAL NOT NULL,
    "marginalTaxRate" REAL NOT NULL,
    "federalTax" REAL NOT NULL,
    "stateTax" REAL NOT NULL,
    "socialSecurityTax" REAL NOT NULL,
    "initialPortfolioBalance" REAL,
    "finalPortfolioBalance" REAL,
    "totalWithdrawals" REAL,
    "portfolioLongevity" REAL,
    "probabilityOfSuccess" REAL,
    "totalLifetimeIncome" REAL NOT NULL,
    "breakEvenAge" REAL,
    "riskScore" REAL NOT NULL,
    "flexibilityScore" REAL NOT NULL,
    "optimizationScore" REAL NOT NULL,
    "yearlyProjections" TEXT,
    "calculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScenarioResult_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "RetirementScenario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScenarioComparison" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "comparisonMetrics" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScenarioComparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScenarioShare" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scenarioId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "recipientName" TEXT,
    "expiresAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" DATETIME,
    "canViewDetails" BOOLEAN NOT NULL DEFAULT true,
    "canDownloadPdf" BOOLEAN NOT NULL DEFAULT false,
    "canDuplicate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScenarioShare_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "RetirementScenario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScenarioShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_RetirementScenarioToScenarioComparison" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_RetirementScenarioToScenarioComparison_A_fkey" FOREIGN KEY ("A") REFERENCES "RetirementScenario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RetirementScenarioToScenarioComparison_B_fkey" FOREIGN KEY ("B") REFERENCES "ScenarioComparison" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PdfGeneration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "pdfType" TEXT NOT NULL,
    "generationTime" INTEGER NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PdfGeneration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PdfGeneration" ("createdAt", "id", "userId") SELECT "createdAt", "id", "userId" FROM "PdfGeneration";
DROP TABLE "PdfGeneration";
ALTER TABLE "new_PdfGeneration" RENAME TO "PdfGeneration";
CREATE INDEX "PdfGeneration_userId_idx" ON "PdfGeneration"("userId");
CREATE INDEX "PdfGeneration_createdAt_idx" ON "PdfGeneration"("createdAt");
CREATE INDEX "PdfGeneration_pdfType_idx" ON "PdfGeneration"("pdfType");
CREATE INDEX "PdfGeneration_success_idx" ON "PdfGeneration"("success");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ActionItem_userId_idx" ON "ActionItem"("userId");

-- CreateIndex
CREATE INDEX "ActionItem_status_idx" ON "ActionItem"("status");

-- CreateIndex
CREATE INDEX "ActionItem_priority_idx" ON "ActionItem"("priority");

-- CreateIndex
CREATE INDEX "ActionItem_category_idx" ON "ActionItem"("category");

-- CreateIndex
CREATE INDEX "ActionItem_createdAt_idx" ON "ActionItem"("createdAt");

-- CreateIndex
CREATE INDEX "RetirementScenario_userId_idx" ON "RetirementScenario"("userId");

-- CreateIndex
CREATE INDEX "RetirementScenario_isBaseline_idx" ON "RetirementScenario"("isBaseline");

-- CreateIndex
CREATE INDEX "RetirementScenario_createdAt_idx" ON "RetirementScenario"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ScenarioResult_scenarioId_key" ON "ScenarioResult"("scenarioId");

-- CreateIndex
CREATE INDEX "ScenarioResult_calculatedAt_idx" ON "ScenarioResult"("calculatedAt");

-- CreateIndex
CREATE INDEX "ScenarioComparison_userId_idx" ON "ScenarioComparison"("userId");

-- CreateIndex
CREATE INDEX "ScenarioComparison_createdAt_idx" ON "ScenarioComparison"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ScenarioShare_shareToken_key" ON "ScenarioShare"("shareToken");

-- CreateIndex
CREATE INDEX "ScenarioShare_scenarioId_idx" ON "ScenarioShare"("scenarioId");

-- CreateIndex
CREATE INDEX "ScenarioShare_userId_idx" ON "ScenarioShare"("userId");

-- CreateIndex
CREATE INDEX "ScenarioShare_shareToken_idx" ON "ScenarioShare"("shareToken");

-- CreateIndex
CREATE INDEX "ScenarioShare_expiresAt_idx" ON "ScenarioShare"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "_RetirementScenarioToScenarioComparison_AB_unique" ON "_RetirementScenarioToScenarioComparison"("A", "B");

-- CreateIndex
CREATE INDEX "_RetirementScenarioToScenarioComparison_B_index" ON "_RetirementScenarioToScenarioComparison"("B");
