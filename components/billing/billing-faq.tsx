"use client"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle } from "lucide-react"

export function BillingFAQ() {
    const faqs = [
        {
            question: "How do I cancel my subscription?",
            answer: "You can cancel your subscription at any time by clicking the 'Cancel Subscription' button in your billing dashboard. Your access will continue until the end of your current billing period."
        },
        {
            question: "Can I switch plans?",
            answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected immediately, and prorated charges or credits will be applied to your next bill."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) and secure online payments via Stripe."
        },
        {
            question: "Where can I find my invoices?",
            answer: "Your billing history and downloadable invoices are available in the 'Billing History' section of this page. You can download PDF receipts for all past transactions."
        },
        {
            question: "Do you offer refunds?",
            answer: "We offer a 30-day money-back guarantee for new subscriptions. If you're not satisfied, please contact our support team within 30 days of your purchase."
        },
        {
            question: "Is my payment information secure?",
            answer: "Yes, we use Stripe for payment processing. We do not store your credit card information on our servers. Stripe is PCI Service Provider Level 1 certified, the most stringent level of certification available."
        }
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-blue-500" />
                    Frequently Asked Questions
                </CardTitle>
                <CardDescription>
                    Common questions about billing and subscriptions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left font-medium text-slate-900 hover:text-blue-600">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-600 leading-relaxed">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    )
}
