import { render, screen, waitFor, act, fireEvent } from "@testing-library/react"
import { PensionChatbot } from "@/components/pension-chatbot/PensionChatbot"
import React from "react"

// Mock ScrollArea
jest.mock("@/components/ui/scroll-area", () => ({
    ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn()

// Mock framer-motion
jest.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe("PensionChatbot", () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it("completes the full conversation flow", async () => {
        render(<PensionChatbot />)

        // Initial greeting
        act(() => {
            jest.advanceTimersByTime(2500)
        })

        await waitFor(() => {
            expect(screen.getByText(/which employee group do you belong to/i)).toBeInTheDocument()
        })

        // Select Group 1
        fireEvent.click(screen.getByText(/Group 1/i))

        act(() => {
            jest.advanceTimersByTime(2000)
        })

        await waitFor(() => {
            expect(screen.getByText(/When did you enter membership/i)).toBeInTheDocument()
        })

        // Select Pre-2012
        fireEvent.click(screen.getByText(/Before April 2, 2012/i))

        act(() => {
            jest.advanceTimersByTime(2000)
        })

        await waitFor(() => {
            expect(screen.getByText(/What will be your age at retirement/i)).toBeInTheDocument()
        })

        // Enter Age
        const input = screen.getByRole("textbox")
        fireEvent.change(input, { target: { value: "60" } })
        fireEvent.click(screen.getByRole("button", { name: /send/i }))

        act(() => {
            jest.advanceTimersByTime(2000)
        })

        await waitFor(() => {
            expect(screen.getByText(/How many years of creditable service/i)).toBeInTheDocument()
        })

        // Enter YOS
        fireEvent.change(input, { target: { value: "30" } })
        fireEvent.click(screen.getByRole("button", { name: /send/i }))

        act(() => {
            jest.advanceTimersByTime(2000)
        })

        await waitFor(() => {
            expect(screen.getByText(/estimated average annual salary/i)).toBeInTheDocument()
        })

        // Enter Salary
        fireEvent.change(input, { target: { value: "80000" } })
        fireEvent.click(screen.getByRole("button", { name: /send/i }))

        act(() => {
            jest.advanceTimersByTime(2000)
        })

        await waitFor(() => {
            expect(screen.getByText(/Which pension option/i)).toBeInTheDocument()
        })

        // Select Option A (maximum allowance, no survivor reduction)
        fireEvent.click(screen.getByText(/Option A/i))

        act(() => {
            jest.advanceTimersByTime(2000)
        })

        // Check Results
        await waitFor(() => {
            expect(screen.getByText(/Monthly Benefit/i)).toBeInTheDocument()
            // For Group 1, 60, 30y, pre-2012: Factor 2.0% * 30 = 60%. $80,000 * 0.6 = $48,000. Monthly = 4000.
            expect(screen.getByText(/\$4,000.00/i)).toBeInTheDocument()
        })
    })
})
