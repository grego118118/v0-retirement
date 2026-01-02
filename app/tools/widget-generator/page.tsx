"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, Code, Eye, Settings } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const GROUP_OPTIONS = [
  { value: "none", label: "User selects (default)" },
  { value: "1", label: "Group 1 - General Employees" },
  { value: "2", label: "Group 2 - Probation/Court Officers" },
  { value: "3", label: "Group 3 - State Police" },
  { value: "4", label: "Group 4 - Police/Fire/Corrections" },
]

export default function WidgetGeneratorPage() {
  const [config, setConfig] = useState({
    theme: "auto",
    group: "none",
    lockGroup: false,
    partnerId: "",
    ctaUrl: "",
    ctaText: "",
    showBranding: true,
    width: "400",
    height: "550",
  })
  const [copied, setCopied] = useState(false)
  const [baseUrl, setBaseUrl] = useState("https://www.masspension.com")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin)
    }
  }, [])

  const buildEmbedUrl = () => {
    const params = new URLSearchParams()
    if (config.theme !== "auto") params.set("theme", config.theme)
    if (config.group && config.group !== "none") params.set("group", config.group)
    if (config.lockGroup && config.group !== "none") params.set("lockGroup", "true")
    if (config.partnerId) params.set("partner", config.partnerId)
    if (config.ctaUrl) params.set("ctaUrl", config.ctaUrl)
    if (config.ctaText) params.set("ctaText", config.ctaText)
    if (!config.showBranding) params.set("branding", "false")

    const queryString = params.toString()
    return `${baseUrl}/embed/calculator${queryString ? `?${queryString}` : ""}`
  }

  const embedUrl = buildEmbedUrl()

  const iframeCode = `<iframe
  src="${embedUrl}"
  width="${config.width}"
  height="${config.height}"
  frameborder="0"
  style="border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
  title="Massachusetts Pension Calculator"
  loading="lazy"
></iframe>`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(iframeCode)
      setCopied(true)
      toast({ title: "Copied!", description: "Embed code copied to clipboard" })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" })
    }
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Widget Embed Generator</h1>
        <p className="text-muted-foreground">
          Customize and embed the MA Pension Calculator on your website
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuration
            </CardTitle>
            <CardDescription>Customize the widget appearance and behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div className="space-y-2">
              <Label htmlFor="theme-select">Theme</Label>
              <Select value={config.theme} onValueChange={(v) => setConfig({ ...config, theme: v })}>
                <SelectTrigger id="theme-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (matches user preference)</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Default Group */}
            <div className="space-y-2">
              <Label htmlFor="group-select">Default Retirement Group</Label>
              <Select value={config.group} onValueChange={(v) => setConfig({ ...config, group: v })}>
                <SelectTrigger id="group-select"><SelectValue placeholder="User selects" /></SelectTrigger>
                <SelectContent>
                  {GROUP_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lock Group */}
            {config.group && config.group !== "none" && (
              <div className="flex items-center justify-between">
                <Label htmlFor="lockGroup">Lock group selection</Label>
                <Switch
                  id="lockGroup"
                  checked={config.lockGroup}
                  onCheckedChange={(v) => setConfig({ ...config, lockGroup: v })}
                />
              </div>
            )}

            {/* Partner ID */}
            <div className="space-y-2">
              <Label htmlFor="partner-id">Partner ID (for tracking)</Label>
              <Input
                id="partner-id"
                placeholder="e.g., union-local-123"
                value={config.partnerId}
                onChange={(e) => setConfig({ ...config, partnerId: e.target.value })}
              />
            </div>

            {/* Custom CTA */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cta-text">CTA Button Text</Label>
                <Input
                  id="cta-text"
                  placeholder="Full Analysis"
                  value={config.ctaText}
                  onChange={(e) => setConfig({ ...config, ctaText: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta-url">CTA URL</Label>
                <Input
                  id="cta-url"
                  placeholder="https://..."
                  value={config.ctaUrl}
                  onChange={(e) => setConfig({ ...config, ctaUrl: e.target.value })}
                />
              </div>
            </div>

            {/* Branding */}
            <div className="flex items-center justify-between">
              <Label htmlFor="branding">Show "Powered by" branding</Label>
              <Switch
                id="branding"
                checked={config.showBranding}
                onCheckedChange={(v) => setConfig({ ...config, showBranding: v })}
              />
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  value={config.width}
                  onChange={(e) => setConfig({ ...config, width: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={config.height}
                  onChange={(e) => setConfig({ ...config, height: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview & Code Panel */}
        <div className="space-y-6">
          <Tabs defaultValue="preview">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" /> Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="h-4 w-4" /> Embed Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center p-4 bg-muted/50 rounded-lg min-h-[500px]">
                    <iframe
                      src={embedUrl}
                      width={config.width}
                      height={config.height}
                      style={{ border: "none", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                      title="Widget Preview"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="code" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Embed Code</CardTitle>
                  <CardDescription>Copy this code and paste it into your website HTML</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                      <code>{iframeCode}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={handleCopy}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Integration Notes:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• The widget is responsive and works on mobile devices</li>
                      <li>• For best results, use a minimum width of 320px</li>
                      <li>• The widget respects user&apos;s dark/light mode preference</li>
                      {config.partnerId && (
                        <li>• Partner tracking ID: <code className="bg-muted px-1 rounded">{config.partnerId}</code></li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

