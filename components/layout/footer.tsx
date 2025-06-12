export function Footer() {
  return (
    <footer
      className="border-t py-6"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Massachusetts Pension Estimator. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
