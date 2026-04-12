"use client";

import { ShieldCheck, Lock, Landmark, CheckCircle2 } from "lucide-react";

export default function TrustShield() {
    return (
        <section className="py-12 border-y border-slate-200 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* No-Store Guarantee */}
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 shrink-0 border border-green-100">
                            <Lock size={20} />
                        </div>
                        <div>
                            <h4 className="text-slate-900 font-bold text-sm mb-1">No-Store Guarantee</h4>
                            <p className="text-slate-500 text-xs leading-relaxed">
                                Financial data is processed locally in your browser. We never save your personal benefit amounts to our servers.
                            </p>
                        </div>
                    </div>

                    {/* MA Statute Compliance */}
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                            <Landmark size={20} />
                        </div>
                        <div>
                            <h4 className="text-slate-900 font-bold text-sm mb-1">Capped Citation Accuracy</h4>
                            <p className="text-slate-500 text-xs leading-relaxed">
                                All audit tools are built following M.G.L. c. 32 rules and 2025 federal retroactivity statutes.
                            </p>
                        </div>
                    </div>

                    {/* Local MA Resource */}
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h4 className="text-slate-900 font-bold text-sm mb-1">Verified MA Resource</h4>
                            <p className="text-slate-500 text-xs leading-relaxed">
                                Built specifically for the Massachusetts PERAC and MSRB ecosystem. Not a generic financial blog.
                            </p>
                        </div>
                    </div>

                    {/* Encryption */}
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0 border border-purple-100">
                            <CheckCircle2 size={20} />
                        </div>
                        <div>
                            <h4 className="text-slate-900 font-bold text-sm mb-1">Audit-Ready Logic</h4>
                            <p className="text-slate-500 text-xs leading-relaxed">
                                We update our logic weekly to reflect new Social Security COLA adjustments and state pension reforms.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

