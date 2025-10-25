import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Editorial Policy | Mass Pension",
  description: "Our editorial standards, sources, and review process for Massachusetts retirement content.",
}

export default function EditorialPolicyPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-4">Editorial Policy</h1>
      <p className="text-muted-foreground mb-6">We follow strict standards to ensure accuracy and clarity for Massachusetts retirement content. Content is reviewed by subject-matter experts prior to publication and updated when regulations change.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Standards</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Accuracy aligned with MSRB rules and official sources</li>
        <li>Clear language with actionable guidance</li>
        <li>Citations to official Massachusetts and federal resources</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Review Process</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Initial drafting by the editorial team</li>
        <li>Fact check and expert review (pension and Social Security)</li>
        <li>Final copy edit and publication</li>
      </ul>

      <p className="mt-6">Questions? Contact us via the <a href="/contact" className="underline">contact page</a>.</p>
    </div>
  )
}

