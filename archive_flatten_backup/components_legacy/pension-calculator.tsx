// Add this at the appropriate location in your component
const renderMobileOptimizedLayout = () => {
  return (
    <div className="flex flex-col">
      {/* Calculator Form - Always visible first on mobile */}
      <div className="order-1">
        {renderStepContent()}
      </div>
      
      {/* Results Section - Appears below calculator after submission */}
      {showResults && calculationResult && (
        <div className="order-2 mt-6">
          <PensionResults result={calculationResult} />
          
          {/* Interactive Retirement Benefits Chart */}
          <div className="mt-6 sm:mt-8">
            <CalculatorChart
              calculationData={{
                averageSalary: calculationResult.details.averageSalary,
                group: calculationResult.details.group,
                age: calculationResult.details.age,
                yearsOfService: calculationResult.details.yearsOfService,
                serviceEntry: formData.serviceEntryDate
              }}
              className="mb-4 sm:mb-6"
            />
          </div>
          
          {/* Tabs with min-height for touch targets */}
          <Tabs defaultValue="projection" className="mt-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 h-auto p-1">
              <TabsTrigger 
                value="projection" 
                className="min-h-[44px] text-xs sm:text-sm px-2 sm:px-3 py-2 touch-manipulation"
              >
                <span className="hidden sm:inline">Projection Table</span>
                <span className="sm:hidden">Projection</span>
              </TabsTrigger>
              {/* Add other tabs with similar responsive patterns */}
            </TabsList>
            {/* TabsContent sections */}
          </Tabs>
        </div>
      )}
      
      {/* Loading indicator */}
      {isCalculating && (
        <div className="order-2 flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3"></div>
          <p className="text-sm text-muted-foreground">Calculating your pension estimate...</p>
        </div>
      )}
      
      {/* Error display */}
      {errors.length > 0 && (
        <div className="order-3 mt-4">
          {errors.map((error, index) => (
            <Alert variant="destructive" key={index} className="mb-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  )
}

// Replace the existing step content rendering with this conditional
// At the appropriate location in your component:
{currentStep === 2 ? renderMobileOptimizedLayout() : (
  <div className="space-y-4 sm:space-y-6">
    {renderStepContent()}
  </div>
)}