import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin, Clock, MessageSquare, HelpCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact | MA Pension Estimator",
  description: "Get in touch with our team for support, questions, or feedback about the Massachusetts Pension Estimator tool.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white py-16 md:py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent"></div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
              Contact
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Us
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
              Have questions about your retirement benefits or need help with our calculator?
              We're here to help you plan for a <strong>secure financial future</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <section>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50">
              <CardHeader className="pb-4 lg:pb-6 xl:pb-8 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
                <CardTitle className="flex items-center gap-3 lg:gap-4 text-lg lg:text-xl xl:text-2xl">
                  <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md">
                    <MessageSquare className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
                  </div>
                  Send us a Message
                </CardTitle>
                <CardDescription className="text-sm lg:text-base xl:text-lg">
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
                <form className="space-y-4 lg:space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm lg:text-base">First Name</Label>
                      <Input id="firstName" placeholder="Enter your first name" className="h-10 lg:h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm lg:text-base">Last Name</Label>
                      <Input id="lastName" placeholder="Enter your last name" className="h-10 lg:h-12" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm lg:text-base">Email Address</Label>
                    <Input id="email" type="email" placeholder="Enter your email address" className="h-10 lg:h-12" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm lg:text-base">Subject</Label>
                    <Input id="subject" placeholder="What's this about?" className="h-10 lg:h-12" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm lg:text-base">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      className="min-h-[120px] lg:min-h-[140px]"
                    />
                  </div>

                  <Button type="submit" className="w-full h-10 lg:h-12 text-sm lg:text-base shadow-sm hover:shadow-md transition-all duration-200">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>

        {/* Contact Information */}
        <section className="space-y-6">
          {/* Support Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-green-600" />
                Get Support
              </CardTitle>
              <CardDescription>
                Need help with the calculator or have questions about your benefits?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">support@mapensionestimator.com</p>
                  <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Support Hours</p>
                  <p className="text-sm text-muted-foreground">Monday - Friday: 9:00 AM - 5:00 PM EST</p>
                  <p className="text-xs text-muted-foreground">Excluding holidays</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Official Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Official Massachusetts Resources</CardTitle>
              <CardDescription>
                For official benefit information and retirement applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">MA State Retirement Board</p>
                  <p className="text-sm text-muted-foreground">(617) 367-7770</p>
                  <p className="text-xs text-muted-foreground">Monday-Friday, 8:30 AM - 5:00 PM</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Office Location</p>
                  <p className="text-sm text-muted-foreground">
                    One Ashburton Place, Room 409<br />
                    Boston, MA 02108
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium">PERAC</p>
                  <p className="text-sm text-muted-foreground">(617) 727-9930</p>
                  <p className="text-xs text-muted-foreground">Monday-Friday, 9:00 AM - 5:00 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Reference */}
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-lg">Before You Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Many common questions are answered in our FAQ section. Check there first 
                for quick answers about benefit calculations, eligibility, and planning strategies.
              </p>
              <Button variant="outline" className="w-full">
                View FAQ
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Disclaimer */}
      <section className="mt-12">
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="text-lg">Important Note</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We provide general information and calculator tools for planning purposes.
              For official benefit calculations, retirement applications, and specific benefit
              questions, please contact the Massachusetts State Retirement Board directly.
              We cannot provide official benefit determinations or legal advice.
            </p>
          </CardContent>
        </Card>
      </section>
      </div>
    </div>
  )
}
