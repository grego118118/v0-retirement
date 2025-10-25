/*
  Warnings:

  - You are about to drop the `ActionItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RetirementScenario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScenarioComparison` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScenarioResult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScenarioShare` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RetirementScenarioToScenarioComparison` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `errorMessage` on the `PdfGeneration` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `PdfGeneration` table. All the data in the column will be lost.
  - You are about to drop the column `generationTime` on the `PdfGeneration` table. All the data in the column will be lost.
  - You are about to drop the column `pdfType` on the `PdfGeneration` table. All the data in the column will be lost.
  - You are about to drop the column `success` on the `PdfGeneration` table. All the data in the column will be lost.
  - You are about to drop the column `plannedRetirementAge` on the `RetirementProfile` table. All the data in the column will be lost.
  - Added the required column `size` to the `PdfGeneration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `PdfGeneration` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ActionItem_createdAt_idx";

-- DropIndex
DROP INDEX "ActionItem_category_idx";

-- DropIndex
DROP INDEX "ActionItem_priority_idx";

-- DropIndex
DROP INDEX "ActionItem_status_idx";

-- DropIndex
DROP INDEX "ActionItem_userId_idx";

-- DropIndex
DROP INDEX "RetirementScenario_createdAt_idx";

-- DropIndex
DROP INDEX "RetirementScenario_isBaseline_idx";

-- DropIndex
DROP INDEX "RetirementScenario_userId_idx";

-- DropIndex
DROP INDEX "ScenarioComparison_createdAt_idx";

-- DropIndex
DROP INDEX "ScenarioComparison_userId_idx";

-- DropIndex
DROP INDEX "ScenarioResult_calculatedAt_idx";

-- DropIndex
DROP INDEX "ScenarioResult_scenarioId_key";

-- DropIndex
DROP INDEX "ScenarioShare_expiresAt_idx";

-- DropIndex
DROP INDEX "ScenarioShare_shareToken_idx";

-- DropIndex
DROP INDEX "ScenarioShare_userId_idx";

-- DropIndex
DROP INDEX "ScenarioShare_scenarioId_idx";

-- DropIndex
DROP INDEX "ScenarioShare_shareToken_key";

-- DropIndex
DROP INDEX "_RetirementScenarioToScenarioComparison_B_index";

-- DropIndex
DROP INDEX "_RetirementScenarioToScenarioComparison_AB_unique";

-- AlterTable
ALTER TABLE "User" ADD COLUMN "retirementDate" DATETIME;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ActionItem";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RetirementScenario";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ScenarioComparison";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ScenarioResult";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ScenarioShare";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_RetirementScenarioToScenarioComparison";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PdfGeneration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "filename" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PdfGeneration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PdfGeneration" ("createdAt", "id", "userId") SELECT "createdAt", "id", "userId" FROM "PdfGeneration";
DROP TABLE "PdfGeneration";
ALTER TABLE "new_PdfGeneration" RENAME TO "PdfGeneration";
CREATE INDEX "PdfGeneration_userId_idx" ON "PdfGeneration"("userId");
CREATE INDEX "PdfGeneration_createdAt_idx" ON "PdfGeneration"("createdAt");
CREATE INDEX "PdfGeneration_type_idx" ON "PdfGeneration"("type");
CREATE TABLE "new_RetirementProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "membershipDate" DATETIME NOT NULL,
    "retirementGroup" TEXT NOT NULL,
    "benefitPercentage" REAL NOT NULL,
    "currentSalary" REAL NOT NULL,
    "averageHighest3Years" REAL,
    "yearsOfService" REAL,
    "retirementDate" DATETIME,
    "retirementOption" TEXT,
    "estimatedSocialSecurityBenefit" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RetirementProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RetirementProfile" ("averageHighest3Years", "benefitPercentage", "createdAt", "currentSalary", "dateOfBirth", "id", "membershipDate", "retirementDate", "retirementGroup", "retirementOption", "updatedAt", "userId", "yearsOfService") SELECT "averageHighest3Years", "benefitPercentage", "createdAt", "currentSalary", "dateOfBirth", "id", "membershipDate", "retirementDate", "retirementGroup", "retirementOption", "updatedAt", "userId", "yearsOfService" FROM "RetirementProfile";
DROP TABLE "RetirementProfile";
ALTER TABLE "new_RetirementProfile" RENAME TO "RetirementProfile";
CREATE UNIQUE INDEX "RetirementProfile_userId_key" ON "RetirementProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
