import { PDFTestComponent } from '@/components/debug/pdf-test-component'

export default function TestPDFPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PDF Generation Test Page
          </h1>
          <p className="text-gray-600">
            Test the PDF report generation functionality for the Massachusetts Retirement System calculator
          </p>
        </div>
        
        <PDFTestComponent />
      </div>
    </div>
  )
}
