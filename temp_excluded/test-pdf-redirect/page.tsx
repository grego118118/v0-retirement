import { PDFRedirectTest } from '@/components/test/pdf-redirect-test'

export default function TestPDFRedirectPage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            PDF Redirect Test Page
          </h1>
          <p className="text-muted-foreground">
            Test the PDF generation redirect functionality for different user states
          </p>
        </div>
        
        <PDFRedirectTest />
      </div>
    </div>
  )
}
