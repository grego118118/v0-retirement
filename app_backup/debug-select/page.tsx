import { DebugSelectTest } from "@/components/debug-select-test"

export default function DebugSelectPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Select Component Debug Page
      </h1>
      <DebugSelectTest />
      
      <div className="max-w-2xl mx-auto mt-8 p-4 bg-blue-50 rounded">
        <h2 className="font-medium mb-2">Testing Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Open browser developer tools (F12)</li>
          <li>Check the Console tab for any JavaScript errors</li>
          <li>Try clicking on the dropdown triggers</li>
          <li>Verify that dropdown content appears</li>
          <li>Test selecting different options</li>
          <li>Check if state updates correctly</li>
          <li>Use manual test buttons if dropdowns don't work</li>
        </ol>
      </div>
    </div>
  )
}
