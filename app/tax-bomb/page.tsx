import TaxBombOptimizer from "@/components/marketing/TaxBombOptimizer";
import { ShieldAlert, Zap, Landmark, ArrowRight, TrendingUp, CheckCircle, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
    title: "The Tax Bomb Defuser | MassPension.com",
    description: "Calculate if your new Social Security benefits will push you into a higher tax bracket and how to use the SMART Plan to stay tax-free.",
};

export default function TaxBombPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section - Matching Homepage Style */}
            <section className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white py-16 md:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="container mrs-page-wrapper relative z-10">
                    <div className="max-w-4xl mx-auto text-center lg:text-left">
                        <Badge className="bg-red-500/20 text-red-100 border-red-400/30 mb-6">
                            <ShieldAlert className="w-3 h-3 mr-1" />
                            Critical 2026 Tax Planning
                        </Badge>

                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
                            Don't Let the IRS Take Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Social Security Windfall.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                            The WEP/GPO repeal means more money in your pocket—but it also means a higher "Combined Income" in the eyes of the IRS.
                            <strong> Many Massachusetts retirees will see up to 85% of their new benefits become taxable.</strong>
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content Sections */}
            <main className="flex-1 bg-slate-50 py-12 md:py-20">
                <div className="container mrs-page-wrapper">
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        {/* Left Column: Copy/Strategy */}
                        <div className="space-y-8 order-2 lg:order-1">
                            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-200">
                                <h3 className="text-2xl font-bold text-slate-900 mb-6 italic">"The Stealth Tax Shift"</h3>
                                <p className="text-slate-600 leading-relaxed mb-8">
                                    Under current IRS rules, if your income exceeds certain thresholds, your Social Security benefits are no longer "tax-free."
                                    By receiving the benefits you earned, you might inadvertently push yourself into a higher tax bracket.
                                </p>

                                <div className="p-8 rounded-3xl bg-blue-50 border border-blue-100 relative mb-8">
                                    <Zap className="text-blue-600 absolute -top-4 -left-4" size={40} />
                                    <h4 className="text-slate-900 font-bold mb-4">The SMART Plan Reflector</h4>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                        Massachusetts state and local employees have a unique weapon: the <strong>Section 457(b) SMART Plan</strong>.
                                        Unlike a 401(k), the SMART plan has higher catch-up limits and allows you to "defer" your SS windfall directly into a pre-tax account.
                                    </p>
                                    <div className="flex items-center gap-2 text-blue-700 font-bold text-sm cursor-pointer hover:underline">
                                        Read the Tax Arbitrage Whitepaper <ArrowRight size={16} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                            <Landmark className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm mb-1">IRS Form 1040-SR</h4>
                                            <p className="text-xs text-slate-500">Planning for the senior-specific tax return.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                            <ShieldAlert className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm mb-1">Bracket Creep</h4>
                                            <p className="text-xs text-slate-500">Avoiding the 22% and 24% tax cliffs.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl">
                                <h4 className="font-bold mb-3 uppercase tracking-widest text-xs opacity-80">Strategic Shield</h4>
                                <p className="text-blue-50 text-sm leading-relaxed italic">
                                    "Our Tax Bomb Defuser is designed to help you keep more of your hard-earned money. By aligning your pension options with Social Security windfalls, we minimize your lifetime tax liability."
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Calculator */}
                        <div className="order-1 lg:order-2 lg:sticky lg:top-32">
                            <TaxBombOptimizer />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

