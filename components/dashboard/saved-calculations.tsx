"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRetirementData } from "@/hooks/use-retirement-data"
import { formatDate, formatCurrency } from "@/lib/utils"
import { EnhancedCalculationCard } from "./enhanced-calculation-card"
import {
  Trash2,
  Eye,
  ArrowRight,
  Heart,
  Calendar,
  DollarSign,
  Star,
  Loader2,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Plus
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type SortOption = 'date' | 'name' | 'income' | 'age'
type ViewMode = 'grid' | 'list'

export function SavedCalculations() {
  const router = useRouter()
  const { calculations, deleteCalculation, updateCalculation, loading } = useRetirementData()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [calculationToDelete, setCalculationToDelete] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterGroup, setFilterGroup] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Filtered and sorted calculations
  const filteredAndSortedCalculations = useMemo(() => {
    let filtered = calculations.filter(calc => {
      // Search filter
      const matchesSearch = !searchTerm ||
        calc.calculationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        calc.notes?.toLowerCase().includes(searchTerm.toLowerCase())

      // Group filter
      const matchesGroup = filterGroup === 'all' ||
        calc.retirementGroup === filterGroup ||
        (filterGroup === 'favorites' && calc.isFavorite)

      return matchesSearch && matchesGroup
    })

    // Sort calculations
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt || 0).getTime()
          bValue = new Date(b.createdAt || 0).getTime()
          break
        case 'name':
          aValue = a.calculationName?.toLowerCase() || ''
          bValue = b.calculationName?.toLowerCase() || ''
          break
        case 'income':
          aValue = a.monthlyBenefit + (a.socialSecurityData?.selectedMonthlyBenefit || 0)
          bValue = b.monthlyBenefit + (b.socialSecurityData?.selectedMonthlyBenefit || 0)
          break
        case 'age':
          aValue = a.retirementAge
          bValue = b.retirementAge
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [calculations, searchTerm, sortBy, sortOrder, filterGroup])

  const handleDelete = async (id: string) => {
    setCalculationToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (calculationToDelete) {
      await deleteCalculation(calculationToDelete)
      setDeleteDialogOpen(false)
      setCalculationToDelete(null)
    }
  }

  const handleView = (id: string) => {
    router.push(`/calculator?load=${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/wizard?edit=${id}`)
  }

  const handleToggleFavorite = async (id: string) => {
    const calculation = calculations.find(calc => calc.id === id)
    if (calculation) {
      await updateCalculation(id, { isFavorite: !calculation.isFavorite })
    }
  }

  const getOptionDescription = (option: string) => {
    switch (option) {
      case 'A': return 'Maximum Allowance'
      case 'B': return 'Annuity Protection'
      case 'C': return 'Joint Survivor'
      default: return option
    }
  }

  // Show loading skeleton while data is being fetched
  if (loading && (!calculations || calculations.length === 0)) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg border bg-card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!calculations || calculations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <div className="h-12 w-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-2">No saved calculations yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first pension calculation to compare different retirement scenarios.
          </p>
        </div>
        <Button onClick={() => router.push("/calculator")}>
          Create New Calculation <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search calculations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select value={filterGroup} onValueChange={setFilterGroup}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              <SelectItem value="favorites">Favorites</SelectItem>
              <SelectItem value="1">Group 1</SelectItem>
              <SelectItem value="2">Group 2</SelectItem>
              <SelectItem value="3">Group 3</SelectItem>
              <SelectItem value="4">Group 4</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="age">Age</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredAndSortedCalculations.length} of {calculations.length} calculations
          {searchTerm && ` matching "${searchTerm}"`}
        </span>
        <Button variant="outline" size="sm" onClick={() => router.push('/wizard')}>
          <Plus className="h-4 w-4 mr-1" />
          New Analysis
        </Button>
      </div>

      {/* Calculations Display */}
      {filteredAndSortedCalculations.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No calculations found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterGroup !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first retirement analysis to get started'
            }
          </p>
          <Button onClick={() => router.push('/wizard')}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Analysis
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 lg:grid-cols-2 gap-4"
            : "space-y-4"
          }>
            {filteredAndSortedCalculations.map((calc) => (
              <EnhancedCalculationCard
                key={calc.id}
                calculation={calc}
                onView={handleView}
                onEdit={handleEdit}
                onToggleFavorite={handleToggleFavorite}
                isExpanded={viewMode === 'list'}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Calculation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this calculation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 