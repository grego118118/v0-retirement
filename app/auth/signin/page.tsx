import type { Metadata } from "next"
import { SignInForm } from "@/components/auth/sign-in-form"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Massachusetts Pension Estimator account",
}

export default function SignInPage() {
  return (
    <div className="container max-w-screen-md py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Sign In</h1>
      <SignInForm />
    </div>
  )
}
