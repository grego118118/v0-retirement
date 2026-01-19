"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, User, Bot, RefreshCw, Calculator, DollarSign, Calendar, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { calculateAnnualPension, calculatePensionPercentage } from "@/lib/pension-calculations"
import { Badge } from "@/components/ui/badge"

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
}

const INITIAL_DATA: UserData = {
    group: "",
    serviceEntry: "before_2012",
    age: 0,
    yos: 0,
    salary: 0,
}

export function PensionChatbot() {
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState("")
    const [step, setStep] = useState<"INIT" | "GROUP" | "SERVICE_ENTRY" | "AGE" | "YOS" | "SALARY" | "OPTION" | "BENEFICIARY_AGE" | "DONE">("INIT")
    const [userData, setUserData] = useState<UserData & { option: "A" | "B" | "C", beneficiaryAge: string }>({
        ...INITIAL_DATA,
        option: "A",
        beneficiaryAge: ""
    })
    const [isTyping, setIsTyping] = useState(false)
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    const addMessage = (sender: "user" | "bot", text: React.ReactNode, type: "text" | "options" | "result" = "text", options?: { label: string; value: string }[]) => {
        const newMessage: Message = {
            id: Math.random().toString(36).substring(7),
            sender,
            text,
            type,
            options,
        }
        setMessages((prev) => [...prev, newMessage])
    }

    const simulateTyping = (callback: () => void) => {
        setIsTyping(true)
        setTimeout(() => {
            setIsTyping(false)
            callback()
        }, 1000)
    }

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight
            }
        }
    }, [messages, isTyping])

    // Initialize chat
    useEffect(() => {
        if (step === "INIT") {
            simulateTyping(() => {
                addMessage("bot", "Hello! I'm your MA State Retirement Pension Assistant. I can help you estimate your future pension benefits.", "text")
                setTimeout(() => {
                    simulateTyping(() => {
                        askGroup()
                    })
                }, 500)
            })
        }
    }, [])

    const askGroup = () => {
        addMessage("bot", "First, which employee group do you belong to?", "options", [
            { label: "Group 1 (Officials, General Employees)", value: "GROUP_1" },
            { label: "Group 2 (Hazardous Occupations)", value: "GROUP_2" },
            { label: "Group 3 (State Police)", value: "GROUP_3" },
            { label: "Group 4 (Public Safety/Corrections)", value: "GROUP_4" },
        ])
        setStep("GROUP")
    }

    const askServiceEntry = () => {
        addMessage("bot", "When did you enter membership in the Massachusetts retirement system?", "options", [
            { label: "Before April 2, 2012", value: "before_2012" },
            { label: "On or After April 2, 2012", value: "after_2012" },
        ])
        setStep("SERVICE_ENTRY")
    }

    const askAge = () => {
        addMessage("bot", "What will be your age at retirement? (e.g., 60)", "text")
        setStep("AGE")
    }

    const askYOS = () => {
        addMessage("bot", "How many years of creditable service will you have? (e.g., 25)", "text")
        setStep("YOS")
    }

    const askSalary = () => {
        addMessage("bot", "What is your estimated average annual salary (average of 3 highest consecutive years)? (e.g., 85000)", "text")
        setStep("SALARY")
    }

    const askOption = () => {
        addMessage("bot", "Which pension option would you like to calculate?", "options", [
            { label: "Option A (Maximum Allowance, no survivor)", value: "A" },
            { label: "Option B (Annuity Protection, ~1% reduction)", value: "B" },
            { label: "Option C (Joint & Survivor, pop-up provision)", value: "C" },
        ])
        setStep("OPTION")
    }

    const askBeneficiaryAge = () => {
        addMessage("bot", "What is your beneficiary's age?", "text")
        setStep("BENEFICIARY_AGE")
    }

    const calculateAndShowResults = (data: typeof userData) => {
        try {
            const percentage = calculatePensionPercentage(data.age, data.yos, data.group, data.serviceEntry)
            const annual = calculateAnnualPension(
                data.salary,
                data.age,
                data.yos,
                data.option,
                data.group,
                data.serviceEntry,
                data.beneficiaryAge
            )
            const monthly = annual / 12

            // Format currency
            const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)

            const resultMessage = (
                <div className="space-y-4">
                    <p>Based on the information provided, here is your estimated pension under <strong>Option {data.option}</strong>:</p>
                    <div className="grid gap-3">
                        <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                            <div className="text-sm text-muted-foreground flex items-center gap-2"><Calculator className="w-4 h-4" /> Pension Percentage</div>
                            <div className="text-2xl font-bold text-primary">{percentage.toFixed(2)}%</div>
                        </div>
                        <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                            <div className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" /> Monthly Benefit</div>
                            <div className="text-2xl font-bold text-primary">{formatCurrency(monthly)}</div>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                            <div className="text-sm text-muted-foreground">Annual Benefit</div>
                            <div className="text-lg font-semibold">{formatCurrency(annual)}</div>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        *This is an estimate. Actual benefits may vary. {data.option === "C" ? "Survivor benefit is 66.67% of the Option C amount." : ""}
                    </p>
                </div>
            )

            addMessage("bot", resultMessage, "result")

            setTimeout(() => {
                addMessage("bot", "Would you like to calculate another estimate?", "options", [
                    { label: "Start Over", value: "restart" }
                ])
            }, 1000)

            setStep("DONE")
        } catch (error) {
            console.error(error)
            addMessage("bot", "I encountered an error calculating your pension. Please try again.", "text")
            addMessage("bot", "Would you like to start over?", "options", [
                { label: "Start Over", value: "restart" }
            ])
            setStep("DONE")
        }
    }

    const handleOptionSelect = (option: { label: string; value: string }) => {
        addMessage("user", option.label)

        if (option.value === "restart") {
            setUserData({ ...INITIAL_DATA, option: "A", beneficiaryAge: "" })
            setMessages([])
            setStep("INIT")
            setTimeout(() => {
                addMessage("bot", "Hello! I'm your MA State Retirement Pension Assistant. I can help you estimate your future pension benefits.", "text")
                setTimeout(() => {
                    simulateTyping(() => {
                        askGroup()
                    })
                }, 500)
            }, 100)
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
                // Calculate directly for A and B
                // We need to use the state we just set, but since setState is async, we pass the new value directly
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
                    addMessage("bot", "Please enter a valid age between 18 and 80.")
                    setStep("AGE")
                } else {
                    setUserData(prev => ({ ...prev, age }))
                    askYOS()
                }
            } else if (step === "YOS") {
                const yos = parseFloat(input)
                if (isNaN(yos) || yos < 0 || yos > 60) {
                    addMessage("bot", "Please enter a valid number of years (0-60).")
                    setStep("YOS")
                } else {
                    setUserData(prev => ({ ...prev, yos }))
                    askSalary()
                }
            } else if (step === "SALARY") {
                const cleanInput = input.replace(/[$,]/g, "")
                const salary = parseFloat(cleanInput)
                if (isNaN(salary) || salary < 0) {
                    addMessage("bot", "Please enter a valid salary amount.")
                    setStep("SALARY")
                } else {
                    setUserData(prev => ({ ...prev, salary }))
                    askOption()
                }
            } else if (step === "BENEFICIARY_AGE") {
                const benAge = parseFloat(input)
                if (isNaN(benAge) || benAge < 0 || benAge > 110) {
                    addMessage("bot", "Please enter a valid age.")
                    setStep("BENEFICIARY_AGE")
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
        <Card className="w-full max-w-2xl mx-auto shadow-xl border-t-4 border-t-primary h-[600px] flex flex-col bg-card/50 backdrop-blur-sm">
            <CardHeader className="border-b bg-card/80 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Bot className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle>Pension Assistant</CardTitle>
                        <CardDescription>Interactive Retirement Estimator</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden relative">
                <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                    <div className="space-y-4 pb-4">
                        <AnimatePresence>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${msg.sender === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                                            : "bg-muted/80 text-foreground rounded-tl-sm border"
                                            }`}
                                    >
                                        {msg.type === "result" ? (
                                            <div>{msg.text}</div>
                                        ) : (
                                            <p className="leading-relaxed">{msg.text}</p>
                                        )}

                                        {msg.type === "options" && msg.options && (
                                            <div className="mt-3 flex flex-col gap-2">
                                                {msg.options.map((opt) => (
                                                    <Button
                                                        key={opt.value}
                                                        variant="secondary"
                                                        size="sm"
                                                        className="w-full justify-start text-left h-auto py-2 px-3 hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20"
                                                        onClick={() => handleOptionSelect(opt)}
                                                        disabled={step === "DONE" && opt.value !== "restart"}
                                                    >
                                                        {opt.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-start"
                            >
                                <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 h-[46px]">
                                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>

            <CardFooter className="p-4 border-t bg-background">
                <div className="flex w-full items-center gap-2">
                    <Input
                        placeholder={
                            step === "GROUP" || step === "SERVICE_ENTRY" || step === "OPTION" || step === "DONE"
                                ? "Please select an option above..."
                                : "Type your answer..."
                        }
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={step === "GROUP" || step === "SERVICE_ENTRY" || step === "OPTION" || step === "DONE" || isTyping}
                        className="flex-1"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || step === "GROUP" || step === "SERVICE_ENTRY" || step === "OPTION" || step === "DONE" || isTyping}
                        size="icon"
                    >
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}
