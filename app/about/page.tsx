import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About | Massachusetts Pension Estimator",
  description:
    "Learn about the Massachusetts Pension Estimator tool and how it can help state employees plan for retirement.",
}

export default function AboutPage() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">About the Massachusetts Pension Estimator</h1>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
              <CardDescription>
                Helping Massachusetts state employees make informed retirement decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The Massachusetts Pension Estimator was created to help state employees understand their retirement
                benefits and make informed decisions about when to retire. Our tool provides accurate estimates based on
                the official Massachusetts retirement system formulas and factors.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>Understanding the calculation process</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Our pension calculator uses the same formulas and factors as the Massachusetts State Retirement Board to
                estimate your pension benefits. The calculation takes into account:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Your age at retirement</li>
                <li>Your years of creditable service</li>
                <li>Your group classification</li>
                <li>Your highest three consecutive years of regular compensation</li>
                <li>Your retirement option selection (A, B, or C)</li>
                <li>When you entered state service (before or after April 2, 2012)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Privacy</CardTitle>
              <CardDescription>How we handle your information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                For your convenience, the pension calculator saves your inputs locally on your device. This means:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Your data stays on your device and is not sent to any server</li>
                <li>When you return to the calculator, your previous inputs will be automatically loaded</li>
                <li>You can clear your saved data at any time using the clear button in the calculator</li>
                <li>If you use private browsing or clear your browser data, your saved inputs will be removed</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Important Disclaimer</CardTitle>
              <CardDescription>Please read before using the calculator</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This calculator provides unofficial estimates for informational purposes only. It is not financial
                advice. The actual amount of your pension will be determined by the Massachusetts State Retirement Board
                based on verification of your age, membership status, creditable service, "regular compensation"
                amounts, group classification, and statutory limits. We recommend consulting with the State Retirement
                Board for official calculations and information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Get in touch with the Massachusetts State Retirement Board</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                For official pension calculations and information, please contact:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong>Massachusetts State Retirement Board</strong>
                </p>
                <p>One Winter Street, 8th Floor</p>
                <p>Boston, MA 02108</p>
                <p>Phone: (617) 367-7770</p>
                <p>
                  Website:{" "}
                  <a
                    href="https://www.mass.gov/orgs/massachusetts-state-retirement-board"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    www.mass.gov/orgs/massachusetts-state-retirement-board
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
