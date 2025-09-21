import { useState, useEffect } from "react"
import { Navigation } from "@/components/layout/Navigation"
import { EnhancedCandidatesList } from "@/components/candidates/EnhancedCandidatesList"
import { CandidatesFilters } from "@/components/candidates/CandidateFilters"
import { CandidatesKanban } from "@/components/candidates/CandidatesKanban"
import { SearchCommand } from "@/components/ui/search-command"
import { Button } from "@/components/ui/button"
import { List, Kanban, Search } from "lucide-react"
import type { Candidate } from "@/lib/seed-data"

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<"list" | "kanban">("list")
  const [searchOpen, setSearchOpen] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    stage: "",
    page: 1,
    pageSize: 50,
  })
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  })

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: filters.search,
        stage: filters.stage,
        page: filters.page.toString(),
        pageSize: filters.pageSize.toString(),
      })

      const response = await fetch(`/api/candidates?${params}`)
      if (!response.ok) throw new Error("Failed to fetch candidates")

      const data = await response.json()
      setCandidates(data.candidates)
      setPagination({
        total: data.total,
        totalPages: data.totalPages,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [filters.search, filters.stage, filters.page, filters.pageSize])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handleCandidateUpdated = () => {
    fetchCandidates()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Candidates</h1>
            <p className="text-muted-foreground">Manage your candidate pipeline and hiring process</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setSearchOpen(true)} size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant={view === "list" ? "default" : "outline"} onClick={() => setView("list")} size="sm">
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button variant={view === "kanban" ? "default" : "outline"} onClick={() => setView("kanban")} size="sm">
              <Kanban className="h-4 w-4 mr-2" />
              Kanban
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <CandidatesFilters filters={filters} onFilterChange={handleFilterChange} loading={loading} />

          {view === "list" ? (
            <EnhancedCandidatesList
              candidates={candidates}
              loading={loading}
              searchTerm={filters.search}
              stageFilter={filters.stage}
              pagination={pagination}
              currentPage={filters.page}
              onPageChange={handlePageChange}
            />
          ) : (
            <CandidatesKanban
              candidates={candidates}
              loading={loading}
              error={error}
              onCandidateUpdated={handleCandidateUpdated}
            />
          )}
        </div>
      </main>
    </div>
  )
}