import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Download, CheckCircle, Calculator } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Your Retirement Report | Mass Pension",
  robots: { index: false, follow: false },
}

export default async function ReportSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-heading font-bold text-mrs-navy-900 dark:text-white mb-3">
          Thank you — your report is ready
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mb-8">
          Your payment went through and your Complete Retirement Report has been generated. Download it below — a copy has
          also been emailed to you for safekeeping.
        </p>

        {session_id ? (
          <div className="space-y-3">
            <Button
              size="lg"
              className="bg-gradient-to-r from-mrs-gold-500 to-mrs-gold-600 hover:from-mrs-gold-400 hover:to-mrs-gold-500 text-white font-bold w-full sm:w-auto"
              asChild
            >
              <a href={`/api/report/download?session_id=${encodeURIComponent(session_id)}`}>
                <Download className="mr-2 h-5 w-5" />
                Download My Report (PDF)
              </a>
            </Button>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Keep this page bookmarked — you can re-download from the link in your email anytime.
            </p>
          </div>
        ) : (
          <p className="text-sm text-red-600">
            We couldn&rsquo;t find your order reference. Please check your email for the download link, or{" "}
            <Link href="/contact" className="underline">contact support</Link>.
          </p>
        )}

        <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" asChild>
            <Link href="/calculator">
              <Calculator className="mr-2 h-4 w-4" />
              Back to the calculator
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
