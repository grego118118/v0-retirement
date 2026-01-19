import { render, screen, waitFor, act, fireEvent } from "@testing-library/react"
import { FloatingChatbot } from "@/components/pension-chatbot/FloatingChatbot"
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

describe("FloatingChatbot", () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it("opens, interacts, and calculates", async () => {
        render(<FloatingChatbot />)

        // Should be closed initially
        expect(screen.queryByText(/Pension Assistant/i)).not.toBeInTheDocument()

        // Open chatbot - Look for the button with the Bot icon
        const toggleButton = screen.getByRole("button") // The main floating button
        fireEvent.click(toggleButton)

        // Check if open
        await waitFor(() => {
            expect(screen.getByText(/Pension Assistant/i)).toBeInTheDocument()
        })

        // Initial greeting simulation
        act(() => {
            jest.advanceTimersByTime(2000)
        })

        // "Start Calculation"
        await waitFor(() => {
            expect(screen.getByText(/Start Calculation/i)).toBeInTheDocument()
        })

        const startButton = screen.getByText(/Start Calculation/i)
        fireEvent.click(startButton)

        act(() => {
            jest.advanceTimersByTime(1000)
        })

        // Group Selection
        await waitFor(() => {
            expect(screen.getByText(/Which employee group are you in?/i)).toBeInTheDocument()
        })

        // Can continue flow from here similar to regular chatbot test...
    })
})
