import { CalendarDays, FileCheck, CreditCard, DollarSign, CheckCircle2, Users } from "lucide-react"
import { TimelineInfographic } from "./timeline-infographic"

export function WepGpoTimeline() {
  const timelineEvents = [
    {
      date: "January 5, 2025",
      title: "Social Security Fairness Act Signed",
      description:
        "President signs the Social Security Fairness Act into law, officially eliminating the WEP and GPO provisions.",
      icon: <FileCheck className="h-5 w-5" />,
      color: "border-blue-500 bg-blue-50 text-blue-500",
    },
    {
      date: "February 25, 2025",
      title: "SSA Begins Processing Changes",
      description:
        "Social Security Administration begins updating systems and processing benefit adjustments for affected retirees.",
      icon: <Users className="h-5 w-5" />,
      color: "border-purple-500 bg-purple-50 text-purple-500",
    },
    {
      date: "March 2025",
      title: "Retroactive Payments Begin",
      description:
        "SSA begins issuing retroactive payments to beneficiaries for benefits previously withheld due to WEP and GPO.",
      icon: <CreditCard className="h-5 w-5" />,
      color: "border-green-500 bg-green-50 text-green-500",
    },
    {
      date: "April 2025",
      title: "New Monthly Benefit Amounts Begin",
      description:
        "Beneficiaries start receiving their new, higher monthly benefit amounts without WEP/GPO reductions.",
      icon: <DollarSign className="h-5 w-5" />,
      color: "border-emerald-500 bg-emerald-50 text-emerald-500",
    },
    {
      date: "May 2, 2025",
      title: "Implementation Progress Update",
      description: "SSA reports 85% completion rate of processing applications submitted since the law was passed.",
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: "border-amber-500 bg-amber-50 text-amber-500",
    },
    {
      date: "December 31, 2025",
      title: "Full Implementation Expected",
      description:
        "SSA expects to have fully implemented all changes and processed all eligible beneficiaries by this date.",
      icon: <CalendarDays className="h-5 w-5" />,
      color: "border-red-500 bg-red-50 text-red-500",
    },
  ]

  return (
    <TimelineInfographic
      title="Social Security Fairness Act Implementation Timeline"
      description="Key dates in the elimination of the Windfall Elimination Provision (WEP) and Government Pension Offset (GPO)"
      events={timelineEvents}
      className="print:break-inside-avoid"
    />
  )
}
