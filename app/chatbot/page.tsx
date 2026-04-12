import { PensionChatbot } from "@/components/pension-chatbot/PensionChatbot"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Pension Assistant | Mass Benefit",
    description: "Interactive AI assistant to help you estimate your Massachusetts state pension benefits.",
}

export default function ChatbotPage() {
    return (
        <div className="container mx-auto py-12 px-4 md:px-6 min-h-[calc(100vh-80px)] flex items-center justify-center">
            <div className="w-full max-w-4xl space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Pension Assistant</h1>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                        Answer a few simple questions to get an instant estimate of your retirement benefits.
                    </p>
                </div>

                <PensionChatbot />
            </div>
        </div>
    )
}
