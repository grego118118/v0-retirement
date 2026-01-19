"use client";

import { useState } from "react";
import { MoveRight, DollarSign, Calendar, TrendingUp, ShieldCheck, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function SSFABackPayAuditor() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        monthlyReduction: 500,
        retirementMonth: "2024-01",
        email: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const calculateResults = () => {
        const reduction = Number(formData.monthlyReduction);
        const startOfRepeal = new Date("2024-01-01");
        const retirement = new Date(formData.retirementMonth + "-01");
        const today = new Date();

        // The law is retroactive to Jan 1, 2024. 
        // We calculate months of backpay from either Jan 1, 2024 or retirement date (whichever is later)
        const effectiveStartDate = retirement > startOfRepeal ? retirement : startOfRepeal;

        const yearDiff = today.getFullYear() - effectiveStartDate.getFullYear();
        const monthDiff = today.getMonth() - effectiveStartDate.getMonth();
        const totalMonths = (yearDiff * 12) + monthDiff + 1; // +1 to include current month

        return {
            totalBackPay: reduction * totalMonths,
            annualIncrease: reduction * 12,
            monthsCount: totalMonths
        };
    };

    const nextStep = () => setStep((prev) => prev + 1);

    const { totalBackPay, annualIncrease, monthsCount } = calculateResults();

    return (
        <div className="w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
            {/* Top Badge */}
            <div className="absolute top-0 right-0 p-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-700 text-[10px] font-bold uppercase tracking-tighter">
                    <ShieldCheck size={12} />
                    Verified 2024 Retroactivity
                </div>
            </div>


            {step === 1 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-2 text-blue-600">
                        <DollarSign className="w-8 h-8" />
                        <h3 className="text-2xl font-bold text-slate-900">Current Reduction</h3>
                    </div>
                    <p className="text-slate-500 mb-8">
                        How much is currently docked from your Social Security check due to WEP or GPO?
                    </p>


                    <div className="space-y-4">
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                            <input
                                type="number"
                                name="monthlyReduction"
                                value={formData.monthlyReduction}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-4 text-slate-900 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                            />
                        </div>
                        <p className="text-xs text-slate-400 italic">
                            Look at your most recent SSA Benefit Statement under "Windfall Elimination Provision" or "Government Pension Offset".
                        </p>
                    </div>

                    <button
                        onClick={nextStep}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-blue-600/20"
                    >
                        Check Retirement Date <MoveRight />
                    </button>

                </motion.div>
            )}

            {step === 2 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-2 text-blue-600">
                        <Calendar className="w-8 h-8" />
                        <h3 className="text-2xl font-bold text-slate-900">Retirement Status</h3>
                    </div>
                    <p className="text-slate-500 mb-8">
                        When did you start collecting your pension/Social Security? This helps us calculate your retroactive back-pay.
                    </p>

                    <div className="space-y-4">
                        <input
                            type="month"
                            name="retirementMonth"
                            value={formData.retirementMonth}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all [color-scheme:light]"
                        />
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
                            <AlertCircle className="text-blue-600 shrink-0" size={16} />
                            <p className="text-xs text-slate-600">
                                The Social Security Fairness Act repeal is retroactive to January 1, 2024. If you retired before then, your back-pay starts from 1/1/2024.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setStep(1)}
                            className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-all"
                        >
                            Back
                        </button>
                        <button
                            onClick={nextStep}
                            className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-blue-600/20"
                        >
                            Audit My Back-Pay <TrendingUp />
                        </button>
                    </div>

                </motion.div>
            )}

            {step === 3 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="mb-8">
                        <h3 className="text-slate-500 uppercase tracking-widest text-sm font-bold mb-2">
                            Estimated Total Retroactive Check
                        </h3>
                        <div className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2 font-serif">
                            ${totalBackPay.toLocaleString()}
                        </div>
                        <p className="text-blue-600 font-bold">
                            Based on {monthsCount} months of retroactive repeal.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                            <span className="text-xs text-slate-500 block mb-1">New Annual Income</span>
                            <span className="text-xl font-bold text-slate-900">+${annualIncrease.toLocaleString()}</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                            <span className="text-xs text-slate-500 block mb-1">Monthly Recovery</span>
                            <span className="text-xl font-bold text-slate-900">${formData.monthlyReduction}/mo</span>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl mb-8 text-left relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-10 text-blue-600 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={80} />
                        </div>
                        <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                            CLAIM YOUR FOUND MONEY
                        </h4>
                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                            The SSA will not automatically issue high-accuracy checks for all recipients. We've prepared a <strong>Retroactive Audit Guide</strong> and a template to verify your lump-sum amount.
                        </p>

                        <div className="space-y-3">
                            <input
                                type="email"
                                placeholder="Enter email to get your Audit Guide"
                                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-3 rounded-lg text-sm hover:opacity-90 transition-all shadow-lg shadow-blue-600/10">
                                Send My Performance Audit & Map
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => setStep(1)}
                        className="text-slate-300 text-xs hover:text-blue-600 transition-colors"
                    >
                        Recalculate with different numbers
                    </button>

                </motion.div>
            )}

            {/* Source Citation - EEAT Compliance */}
            <div className="mt-12 pt-8 border-t border-slate-100 text-[10px] text-slate-400 leading-tight">
                <p className="mb-2"><strong>SOURCE TRANSPARENCY:</strong> Calculations based on the <em>Social Security Fairness Act (H.R. 82)</em> repeal of the Windfall Elimination Provision (WEP) and Government Pension Offset (GPO), signed January 5, 2025, with retroactivity applied per Section 3(a) of the final statute.</p>
                <p>DISCLAIMER: This tool provides an estimate for planning purposes only. masspension.com is a private research entity and is not affiliated with the SSA, MSRB, or any government agency. Consult with a qualified tax professional regarding the taxation of retroactive lump-sums.</p>
            </div>
        </div>

    );
}
