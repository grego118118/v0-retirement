export default function AuthErrorLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center px-4">
      <div className="animate-pulse">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Loading...</h1>
        <p className="text-muted-foreground mb-6 max-w-md">Please wait while we process your request.</p>
      </div>
    </div>
  )
}
