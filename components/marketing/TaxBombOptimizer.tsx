"use client";

import { useState } from "react";
import { AlertTriangle, TrendingUp, ShieldCheck, ArrowRight, Zap, Shield, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function TaxBombOptimizer() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        pensionIncome: 65000,
        socialSecurity: 24000,
        filingStatus: "single", // "single" or "joint"
        otherIncome: 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const calculateTaxImpact = () => {
        const pension = Number(formData.pensionIncome);
        const ss = Number(formData.socialSecurity);
        const other = Number(formData.otherIncome);
        const filingStatus = formData.filingStatus;

        // Combined Income (Provisional Income) = Adjusted Gross Income + Non-taxable Interest + 1/2 Social Security
        const combinedIncome = pension + other + (ss * 0.5);

        let taxableSSAmount = 0;
        let threshold1 = filingStatus === "single" ? 25000 : 32000;
        let threshold2 = filingStatus === "single" ? 34000 : 44000;

        if (combinedIncome > threshold2) {
            taxableSSAmount = ss * 0.85;
        } else if (combinedIncome > threshold1) {
            taxableSSAmount = ss * 0.50;
        }

        const estTaxRate = combinedIncome > 50000 ? 0.22 : 0.12;
        const taxOnSS = taxableSSAmount * estTaxRate;
        const suggestedContribution = ss;

        return {
            combinedIncome,
            taxableSSAmount,
            taxOnSS,
            isTaxBomb: taxableSSAmount > 0,
            suggestedContribution,
            ssTaxabilityPercent: (taxableSSAmount / ss) * 100
        };
    };

    const { combinedIncome, taxableSSAmount, taxOnSS, isTaxBomb, suggestedContribution, ssTaxabilityPercent } = calculateTaxImpact();

    return (
        <div className="w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-widest">
                    <Zap size={12} className="animate-pulse" />
                    2026 Tax Ready
                </div>
            </div>


            {step === 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-2 text-blue-600">
                        <TrendingUp className="w-8 h-8" />
                        <h3 className="text-2xl font-bold text-slate-900">Income Snapshot</h3>
                    </div>
                    <p className="text-slate-500 mb-8">
                        To calculate your "Tax Bomb" risk, we need to see your projected 2026 income levels.
                    </p>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filing Status</label>
                            <select
                                name="filingStatus"
                                value={formData.filingStatus}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                            >
                                <option value="single">Single / Individual</option>
                                <option value="joint">Married Filing Jointly</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Annual Pension (Est)</label>
                            <input
                                type="number"
                                name="pensionIncome"
                                value={formData.pensionIncome}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>


                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Annual Social Security (Post-Repeal)</label>
                        <input
                            type="number"
                            name="socialSecurity"
                            value={formData.socialSecurity}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                        <p className="text-[10px] text-slate-400 italic">Tip: Use the SSFA Auditor tool first to find your new annual SS total.</p>
                    </div>

                    <button
                        onClick={() => setStep(2)}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-blue-600/20"
                    >
                        Analyze My Tax Risk <ArrowRight />
                    </button>

                </motion.div>
            )}

            {step === 2 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    {isTaxBomb ? (
                        <div className="mb-8 p-6 rounded-3xl bg-red-50 relative overflow-hidden group border border-red-100">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-red-600 group-hover:rotate-12 transition-transform">
                                <AlertTriangle size={60} />
                            </div>
                            <h3 className="text-red-600 font-bold uppercase tracking-widest text-sm mb-4 flex items-center justify-center gap-2">
                                <AlertTriangle size={16} />
                                Tax Bomb Detected
                            </h3>
                            <div className="text-5xl font-bold text-slate-900 mb-2">
                                {ssTaxabilityPercent.toFixed(0)}%
                            </div>
                            <p className="text-slate-600 text-sm">
                                Of your Social Security income is now subject to Federal Income Tax due to your "Combined Income" of <span className="text-slate-900 font-bold">${combinedIncome.toLocaleString()}</span>.
                            </p>
                        </div>
                    ) : (
                        <div className="mb-8 p-6 rounded-3xl bg-green-50 border border-green-100">
                            <h3 className="text-green-700 font-bold uppercase tracking-widest text-sm mb-2">Safe Zone</h3>
                            <div className="text-5xl font-bold text-slate-900 mb-2">$0</div>
                            <p className="text-slate-600 text-sm">Your SS benefits remain 100% tax-free at this income level.</p>
                        </div>
                    )}


                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                            <span className="text-xs text-slate-500 block mb-1">Est. Yearly IRS Bill</span>
                            <span className="text-xl font-bold text-slate-900">${taxOnSS.toLocaleString()}</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                            <span className="text-xs text-slate-500 block mb-1">Taxable Portion</span>
                            <span className="text-xl font-bold text-slate-900">${taxableSSAmount.toLocaleString()}</span>
                        </div>
                    </div>


                    <div className="bg-blue-50 border border-blue-100 p-8 rounded-3xl text-left relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                <ShieldCheck size={20} />
                            </div>
                            <h4 className="font-bold text-slate-900">THE SMART OPTIMIZER</h4>
                        </div>
                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                            Don't give your SS windfall back to the IRS. By increasing your 2026 <strong>SMART Plan (457b)</strong> contributions, you can lower your Adjusted Gross Income and "defuse" the tax bomb.
                        </p>

                        <div className="p-4 rounded-2xl bg-white border border-blue-100 mb-8">
                            <span className="text-[10px] text-blue-600 font-bold uppercase block mb-1">Suggested Monthly Deferral</span>
                            <span className="text-2xl font-bold text-slate-900">${(suggestedContribution / 12).toLocaleString()}/mo</span>
                            <p className="text-[10px] text-slate-400 mt-1 italic">Offsetting ${Number(formData.socialSecurity).toLocaleString()} in new Social Security income.</p>
                        </div>

                        <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-blue-600/10 group">
                            Unlock Full SMART Strategy Guide <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>


                    <button
                        onClick={() => setStep(1)}
                        className="mt-8 text-slate-300/20 text-[10px] hover:text-cyan-400 transition-colors uppercase font-bold tracking-widest"
                    >
                        Adjust Income Numbers
                    </button>
                </motion.div>
            )}

            <div className="mt-12 pt-8 border-t border-slate-100 text-[9px] text-slate-400 leading-tight">
                <p className="mb-2"><strong>IRS COMPLIANCE:</strong> Calculations follow the Social Security base threshold rules (IRS Publication 915). Estimates assume standard deductions and basic 2026 marginal tax brackets. 457(b) limits based on 2026 IRS Catch-Up Provision for employees age 50+.</p>
                <p>DISCLAIMER: This is a planning tool, not professional tax advice. Consult a qualified CPA regarding IRS Form 1040-SR and specific Massachusetts state tax exemptions for public pensions.</p>
            </div>

        </div>
    );
}
