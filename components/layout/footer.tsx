export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Massachusetts Pension Estimator. All rights reserved.
      </div>
    </footer>
  )
}
