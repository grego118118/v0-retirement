import SSFABackPayAuditor from "@/components/marketing/SSFABackPayAuditor";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowRight, CheckCircle, TrendingUp } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { RelatedTools } from "@/components/seo/related-tools";

export const metadata = {
    title: "SSFA Back-Pay Auditor | MassPension.com",
    description: "Calculate your retroactive Social Security back-pay under the Social Security Fairness Act repeal of WEP and GPO.",
};

export default function SSFAAuditorPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section - Matching Homepage Style */}
            <section className="bg-mrs-navy-900 text-white py-16 md:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="container mrs-page-wrapper relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <Badge className="bg-mrs-gold-500/20 text-mrs-gold-100 border-mrs-gold-400/30 mb-6 font-heading">
                            <Shield className="w-3 h-3 mr-1" />
                            Social Security Fairness Act Updated
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight mb-6 leading-tight">
                            The WEP/GPO Repeal is <span className="text-mrs-gold-400">Law.</span>
                            <br />
                            Audit Your Back-Pay Now.
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-2xl mx-auto font-sans">
                            Under H.R. 82, Massachusetts public employees are eligible for retroactive benefit recovery starting January 2024.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content Sections */}
            <main className="flex-1 bg-slate-50 dark:bg-slate-900 py-12 md:py-20">
                <div className="container mrs-page-wrapper">
                    <Breadcrumbs
                        items={[
                            { label: "Tools", href: "/calculator" },
                            { label: "SSFA Back-Pay Auditor" },
                        ]}
                        className="mb-8"
                    />
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        {/* Calculator Column */}
                        <div className="order-2 lg:order-1">
                            <SSFABackPayAuditor />
                        </div>

                        {/* Info/Copy Column */}
                        <div className="order-1 lg:order-2 space-y-8">
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 shadow-sm border border-slate-200 dark:border-slate-700">
                                <h3 className="text-2xl font-bold text-mrs-navy-900 dark:text-white mb-6">Why an Audit is Necessary</h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                                    The Social Security Administration processes millions of adjustments. Historically, "manual computation" cases (like retroactive WEP/GPO repeals) take 12-18 months to normalize.
                                    <strong className="text-blue-700"> Our audit tool helps you verify the exact lump-sum check you should expect.</strong>
                                </p>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                            <CheckCircle className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-mrs-navy-900 dark:text-white mb-1">2024 Retroactivity</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">The law covers the full 2024 calendar year, providing a substantial retroactive payment for those already retired.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <TrendingUp className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-mrs-navy-900 dark:text-white mb-1">Immediate Increase</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Stop the monthly "penalties" on your next check and see your permanent benefit increase reflected instantly.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                            <Shield className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-mrs-navy-900 dark:text-white mb-1">Survivor Benefit Reset</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">GPO repeal specifically targets widow/widower benefits, restoring dignity and financial security.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 rounded-3xl bg-mrs-navy-800 text-white shadow-xl border border-mrs-navy-700">
                                <h4 className="font-bold mb-3 uppercase tracking-widest text-xs opacity-80 font-heading">Trust Guarantee</h4>
                                <p className="text-blue-50 text-sm leading-relaxed italic font-sans">
                                    "MassPension.com is a digital-first research platform. We do not store your financial data. All calculations are performed on-device in your browser to ensure 100% privacy for Commonwealth employees."
                                </p>
                            </div>
                        </div>
                    </div>

                    <RelatedTools currentSlug="ssfa-auditor" />
                </div>
            </main>
        </div>
    );
}

