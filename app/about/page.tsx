import TrustShield from "@/components/marketing/TrustShield";
import { User, Cpu, Landmark, ShieldCheck, Mail, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";


export const metadata = {
  title: "About the Developer | MassPension.com",
  description: "The story behind MassPension.com — bringing modern digital transparency to Massachusetts public employee benefits.",
};


export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Matching Site Standard */}
      <section className="bg-mrs-navy-900 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mrs-page-wrapper relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-mrs-gold-500/20 text-mrs-gold-100 border-mrs-gold-400/30 font-heading">
                <User className="w-3 h-3 mr-1" />
                Mission & Purpose
              </Badge>
              <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight leading-tight">
                Bringing <span className="text-transparent bg-clip-text bg-gradient-to-r from-mrs-gold-300 to-mrs-gold-500">Clarity</span> to the Commonwealth.
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-xl font-sans">
                MassPension.com was born out of a simple observation: Massachusetts public employees often have the most complex benefits but the least modern tools to manage them.
              </p>
              <div className="pt-4">
                <Button size="lg" className="bg-white text-mrs-navy-900 hover:bg-slate-100 font-bold rounded-xl" asChild>
                  <a href="mailto:hello@masspension.com">
                    <Mail className="mr-2 h-5 w-5" />
                    Contact Research Team
                  </a>
                </Button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="aspect-square rounded-3xl overflow-hidden bg-white/10 border border-white/20 backdrop-blur-sm relative group shadow-2xl">
                <Image
                  src="/images/about-hero.webp"
                  alt="Developed in Western Massachusetts"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <p className="text-white font-bold text-2xl mb-2 font-heading">Developed in Western MA</p>
                  <p className="text-blue-100/90 text-sm italic leading-relaxed font-sans">
                    "Built by technologists in the Pioneer Valley, for the retirees who built our communities."
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="flex-1 bg-slate-50 dark:bg-slate-900 py-12 md:py-20">
        <div className="container mrs-page-wrapper">
          <Breadcrumbs
            items={[{ label: "About" }]}
            className="mb-8"
          />
          {/* Trust Ticker */}
          <div className="mb-20">
            <TrustShield />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                <Landmark className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Regulatory Accuracy</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                We stay deep in the weeds of PERAC memos and MSRB policy updates. When a new law like the Social Security Fairness Act passes, we update our logic within 48 hours.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6">
                <Cpu className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Modern User Experience</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Benefit calculations shouldn't require a 40-page PDF and a calculator. Our "Audit-as-a-Service" model simplifies complex math into clear, visual signals.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mb-6">
                <ShieldCheck className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Data Sovereignty</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                We pioneered the "No-Store" guarantee. Your pension data is processed in your browser's memory and vanishes the moment you close the tab. Security by design.
              </p>
            </div>
          </div>

          {/* Mission Detail Section */}
          <div className="mt-20 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Commitment to Massachusetts</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                MassPension.com is a private research entity focused on bridging the gap between "official state statutes" and "actionable user experience." We believe that transparency is the ultimate service.
              </p>
              <Link
                href="/methodology"
                className="flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all w-fit"
              >
                Learn more about our research methodology <ArrowRight size={20} />
              </Link>

            </div>
          </div>

          {/* Disclaimer Section */}
          <div className="mt-20 p-8 md:p-12 rounded-3xl bg-slate-100 border border-slate-200 text-center">
            <h4 className="text-slate-900 font-bold mb-4 uppercase tracking-widest text-xs">Official Disclosure</h4>
            <p className="text-slate-500 text-sm max-w-4xl mx-auto leading-relaxed">
              MassPension.com is a private, third-party research and educational platform. We are NOT affiliated with, endorsed by, or representing the Massachusetts State Retirement Board (MSRB), the Massachusetts Teachers' Retirement System (MTRS), PERAC, or any government agency. All calculators provide estimates based on current publicly available statutes and are for planning purposes only.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

