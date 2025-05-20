import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function GoogleAuthGuide() {
  return (
    <div className="mt-8 border rounded-lg p-4">
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Administrator Guide</AlertTitle>
        <AlertDescription>
          This guide is intended for administrators to configure Google authentication.
        </AlertDescription>
      </Alert>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>How to Enable Google Authentication</AccordionTrigger>
          <AccordionContent>
            <ol className="list-decimal pl-5 space-y-4">
              <li>
                <strong>Access Supabase Dashboard</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Log in to your Supabase dashboard at{" "}
                  <a
                    href="https://app.supabase.com"
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://app.supabase.com
                  </a>
                </p>
              </li>

              <li>
                <strong>Navigate to Authentication Settings</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Select your project, then click on "Authentication" in the left sidebar, then "Providers".
                </p>
              </li>

              <li>
                <strong>Enable Google Provider</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Find Google in the list of providers and toggle it to "Enabled".
                </p>
              </li>

              <li>
                <strong>Set Up Google OAuth Credentials</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  You'll need to create OAuth credentials in the Google Cloud Console:
                </p>
                <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
                  <li>
                    Go to{" "}
                    <a
                      href="https://console.cloud.google.com/"
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Google Cloud Console
                    </a>
                  </li>
                  <li>Create a new project or select an existing one</li>
                  <li>Navigate to "APIs & Services" > "Credentials"</li>
                  <li>Click "Create Credentials" > "OAuth client ID"</li>
                  <li>Set the application type to "Web application"</li>
                  <li>Add your domain to "Authorized JavaScript origins"</li>
                  <li>Add your Supabase callback URL to "Authorized redirect URIs"</li>
                </ul>
              </li>

              <li>
                <strong>Configure Redirect URLs</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  For the redirect URI, use:{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">{`https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`}</code>
                </p>
              </li>

              <li>
                <strong>Add Client ID and Secret to Supabase</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Copy the Client ID and Client Secret from Google Cloud Console and paste them into the corresponding
                  fields in the Supabase dashboard.
                </p>
              </li>

              <li>
                <strong>Save Changes</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Save" to apply your changes in the Supabase dashboard.
                </p>
              </li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>Common Issues & Troubleshooting</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Provider Not Enabled Error</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  This error occurs when the Google provider is not enabled in your Supabase project. Follow the steps
                  above to enable it.
                </p>
              </div>

              <div>
                <h4 className="font-medium">Redirect URI Mismatch</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Ensure that the redirect URI in Google Cloud Console exactly matches the one provided by Supabase.
                </p>
              </div>

              <div>
                <h4 className="font-medium">Invalid Client ID or Secret</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Double-check that you've copied the correct Client ID and Client Secret from Google Cloud Console.
                </p>
              </div>

              <div>
                <h4 className="font-medium">API Not Enabled</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Make sure you've enabled the "Google+ API" or "Google People API" in the Google Cloud Console.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
