"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, X, Minimize2, Calculator, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { calculateAnnualPension, calculatePensionPercentage } from "@/lib/pension-calculations"
import { cn } from "@/lib/utils"

type Message = {
    id: string
    sender: "user" | "bot"
    text: React.ReactNode
    type?: "text" | "options" | "result"
    options?: { label: string; value: string }[]
}

type UserData = {
    group: string
    serviceEntry: "before_2012" | "after_2012"
    age: number
    yos: number
    salary: number
    option: "A" | "B" | "C"
    beneficiaryAge: string
}

const INITIAL_DATA: UserData = {
    group: "",
    serviceEntry: "before_2012",
    age: 0,
    yos: 0,
    salary: 0,
    option: "A",
    beneficiaryAge: ""
}

export function FloatingChatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState("")
    const [step, setStep] = useState<"INIT" | "GROUP" | "SERVICE_ENTRY" | "AGE" | "YOS" | "SALARY" | "OPTION" | "BENEFICIARY_AGE" | "DONE">("INIT")
    const [userData, setUserData] = useState<UserData>(INITIAL_DATA)
    const [isTyping, setIsTyping] = useState(false)
    const [hasUnread, setHasUnread] = useState(false)
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    const [showCallout, setShowCallout] = useState(false)

    // Initial greeting trigger when opened first time
    useEffect(() => {
        if (isOpen && messages.length === 0 && step === "INIT") {
            simulateTyping(() => {
                addMessage("bot", "Hi! Need a quick pension estimate?", "text")
                setTimeout(() => {
                    simulateTyping(() => {
                        addMessage("bot", "I can help calculate your benefits in just a few steps.", "options", [
                            { label: "Start Calculation", value: "start" }
                        ])
                    })
                }, 500)
            })
        }
    }, [isOpen])

    // Show callout after 3 seconds if not opened
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isOpen && messages.length === 0) {
                setShowCallout(true)
            }
        }, 3000)
        return () => clearTimeout(timer)
    }, [isOpen, messages.length])

    // Scroll to bottom
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight
            }
        }
    }, [messages, isTyping, isOpen])

    const addMessage = (sender: "user" | "bot", text: React.ReactNode, type: "text" | "options" | "result" = "text", options?: { label: string; value: string }[]) => {
        const newMessage: Message = {
            id: Math.random().toString(36).substring(7),
            sender,
            text,
            type,
            options,
        }
        setMessages((prev) => [...prev, newMessage])
        if (!isOpen && sender === "bot") {
            setHasUnread(true)
        }
    }

    const simulateTyping = (callback: () => void) => {
        setIsTyping(true)
        setTimeout(() => {
            setIsTyping(false)
            callback()
        }, 800)
    }

    const toggleOpen = () => {
        setIsOpen(!isOpen)
        setShowCallout(false)
        if (!isOpen) setHasUnread(false)
    }

    const startFlow = () => {
        setStep("GROUP")
        addMessage("bot", "Great! Which employee group are you in?", "options", [
            { label: "Group 1 (General)", value: "GROUP_1" },
            { label: "Group 2 (Hazardous)", value: "GROUP_2" },
            { label: "Group 3 (State Police)", value: "GROUP_3" },
            { label: "Group 4 (Public Safety)", value: "GROUP_4" },
        ])
    }

    const askServiceEntry = () => {
        addMessage("bot", "When did you enter membership?", "options", [
            { label: "Before 4/2/2012", value: "before_2012" },
            { label: "On/After 4/2/2012", value: "after_2012" },
        ])
        setStep("SERVICE_ENTRY")
    }

    const askAge = () => {
        addMessage("bot", "Age at retirement? (e.g., 60)", "text")
        setStep("AGE")
    }

    const askYOS = () => {
        addMessage("bot", "Years of service? (e.g., 25)", "text")
        setStep("YOS")
    }

    const askSalary = () => {
        addMessage("bot", "Average annual salary? (e.g., 85000)", "text")
        setStep("SALARY")
    }

    const askOption = () => {
        addMessage("bot", "Select Pension Option:", "options", [
            { label: "Option A (Max)", value: "A" },
            { label: "Option B (Annuity)", value: "B" },
            { label: "Option C (Joint)", value: "C" },
        ])
        setStep("OPTION")
    }

    const askBeneficiaryAge = () => {
        addMessage("bot", "Beneficiary's age?", "text")
        setStep("BENEFICIARY_AGE")
    }

    const calculateAndShowResults = (data: UserData) => {
        try {
            const percentage = calculatePensionPercentage(data.age, data.yos, data.group, data.serviceEntry)
            const annual = calculateAnnualPension(data.salary, data.age, data.yos, data.option, data.group, data.serviceEntry, data.beneficiaryAge)
            const monthly = annual / 12
            const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)

            const resultMessage = (
                <div className="space-y-3 text-sm">
                    <p>Estimated Option {data.option} Benefits:</p>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-primary/10 p-2 rounded border border-primary/20 text-center">
                            <div className="text-xs text-muted-foreground">Monthly</div>
                            <div className="text-lg font-bold text-primary">{formatCurrency(monthly)}</div>
                        </div>
                        <div className="bg-primary/10 p-2 rounded border border-primary/20 text-center">
                            <div className="text-xs text-muted-foreground">Percentage</div>
                            <div className="text-lg font-bold text-primary">{percentage.toFixed(1)}%</div>
                        </div>
                    </div>
                </div>
            )

            addMessage("bot", resultMessage, "result")
            setTimeout(() => {
                addMessage("bot", "Calculate again?", "options", [
                    { label: "Restart", value: "restart" }
                ])
            }, 500)
            setStep("DONE")

        } catch (error) {
            addMessage("bot", "Error calculating. Start over?", "options", [{ label: "Restart", value: "restart" }])
            setStep("DONE")
        }
    }

    const handleOptionSelect = (option: { label: string; value: string }) => {
        if (option.value === "start") {
            startFlow()
            return
        }

        addMessage("user", option.label)

        if (option.value === "restart") {
            setUserData(INITIAL_DATA)
            setStep("GROUP")
            startFlow()
            return
        }

        if (step === "GROUP") {
            setUserData(prev => ({ ...prev, group: option.value }))
            simulateTyping(() => askServiceEntry())
        } else if (step === "SERVICE_ENTRY") {
            setUserData(prev => ({ ...prev, serviceEntry: option.value as any }))
            simulateTyping(() => askAge())
        } else if (step === "OPTION") {
            const selectedOption = option.value as "A" | "B" | "C"
            setUserData(prev => ({ ...prev, option: selectedOption }))

            if (selectedOption === "C") {
                simulateTyping(() => askBeneficiaryAge())
            } else {
                const finalData = { ...userData, option: selectedOption }
                simulateTyping(() => calculateAndShowResults(finalData))
            }
        }
    }

    const handleSendMessage = () => {
        if (!inputValue.trim()) return
        const input = inputValue.trim()
        setInputValue("")
        addMessage("user", input)

        simulateTyping(() => {
            if (step === "AGE") {
                const age = parseFloat(input)
                if (isNaN(age) || age < 18 || age > 80) {
                    addMessage("bot", "Please enter a valid age (18-80).")
                } else {
                    setUserData(prev => ({ ...prev, age }))
                    askYOS()
                }
            } else if (step === "YOS") {
                const yos = parseFloat(input)
                if (isNaN(yos) || yos < 0 || yos > 60) {
                    addMessage("bot", "Please enter valid years (0-60).")
                } else {
                    setUserData(prev => ({ ...prev, yos }))
                    askSalary()
                }
            } else if (step === "SALARY") {
                const cleanInput = input.replace(/[$,]/g, "")
                const salary = parseFloat(cleanInput)
                if (isNaN(salary) || salary < 0) {
                    addMessage("bot", "Please enter a valid salary.")
                } else {
                    setUserData(prev => ({ ...prev, salary }))
                    askOption()
                }
            } else if (step === "BENEFICIARY_AGE") {
                const benAge = parseFloat(input)
                if (isNaN(benAge) || benAge < 0 || benAge > 120) {
                    addMessage("bot", "Please enter a valid age.")
                } else {
                    const finalData = { ...userData, beneficiaryAge: input }
                    setUserData(finalData)
                    calculateAndShowResults(finalData)
                }
            }
        })
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSendMessage()
        }
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4"
                    >
                        <Card className="w-[350px] h-[500px] shadow-2xl flex flex-col border-primary/20">
                            <CardHeader className="p-3 border-b flex flex-row items-center justify-between space-y-0 bg-primary/5">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Bot className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm font-bold">Pension Assistant</CardTitle>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                                        <Minimize2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 overflow-hidden relative bg-background/50">
                                <ScrollArea className="h-full p-3" ref={scrollAreaRef}>
                                    <div className="space-y-3 pb-2">
                                        {messages.map((msg) => (
                                            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                                                <div
                                                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${msg.sender === "user"
                                                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                        : "bg-muted text-foreground rounded-tl-sm border"
                                                        }`}
                                                >
                                                    {msg.type === "result" ? msg.text : <p>{msg.text}</p>}
                                                    {msg.type === "options" && msg.options && (
                                                        <div className="mt-2 flex flex-col gap-1">
                                                            {msg.options.map((opt) => (
                                                                <Button
                                                                    key={opt.value}
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className="w-full justify-start text-left h-auto py-1.5 px-2 text-xs hover:bg-primary/5"
                                                                    onClick={() => handleOptionSelect(opt)}
                                                                    disabled={step === "DONE" && opt.value !== "restart"}
                                                                    suppressHydrationWarning
                                                                >
                                                                    {opt.label}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {isTyping && (
                                            <div className="flex justify-start">
                                                <div className="bg-muted px-3 py-2 rounded-2xl rounded-tl-sm flex items-center gap-1 h-[34px]">
                                                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                            <CardFooter className="p-2 border-t bg-background">
                                <div className="flex w-full items-center gap-2">
                                    <Input
                                        placeholder={
                                            step === "GROUP" || step === "SERVICE_ENTRY" || step === "OPTION" || step === "DONE" || (messages.length === 1 && messages[0].options)
                                                ? "Select an option..."
                                                : "Type answer..."
                                        }
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        disabled={step === "GROUP" || step === "SERVICE_ENTRY" || step === "OPTION" || step === "DONE" || isTyping || (messages.length > 0 && messages[messages.length - 1].type === 'options')}
                                        className="flex-1 h-9 text-sm"
                                        suppressHydrationWarning
                                    />
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={!inputValue.trim() || step === "GROUP" || step === "SERVICE_ENTRY" || step === "OPTION" || step === "DONE" || isTyping}
                                        size="icon"
                                        className="h-9 w-9"
                                        suppressHydrationWarning
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showCallout && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.8 }}
                        className="mb-4 mr-2 cursor-pointer relative"
                        onClick={() => {
                            setIsOpen(true)
                            setShowCallout(false)
                        }}
                    >
                        <div className="bg-card text-card-foreground border border-border shadow-lg rounded-2xl p-4 max-w-[200px] relative">
                            <p className="text-sm font-medium pr-2">👋 Need a quick pension estimate?</p>

                            {/* Arrow */}
                            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-card border-b border-r border-border transform rotate-45"></div>

                            {/* Close button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowCallout(false)
                                }}
                                className="absolute -top-2 -right-2 bg-muted rounded-full p-1 hover:bg-muted/80 text-muted-foreground border shadow-sm"
                                aria-label="Close callout"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                onClick={toggleOpen}
                size="icon"
                className={cn(
                    "h-14 w-14 rounded-full shadow-xl transition-all duration-300 hover:scale-110",
                    isOpen ? "rotate-90 bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground"
                )}
                suppressHydrationWarning
            >
                {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-8 w-8" />}
                {!isOpen && hasUnread && (
                    <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-background animate-pulse" />
                )}
            </Button>
        </div>
    )
}
