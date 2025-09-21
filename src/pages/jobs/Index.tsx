import { useState, useEffect } from "react"
import { Navigation } from "@/components/layout/Navigation"
import { JobsList } from "@/components/jobs/JobList"
import { JobFilters } from "@/components/jobs/JobFilters"
import { CreateJobDialog } from "@/components/jobs/CreateJobDialog"
import { SearchCommand } from "@/components/ui/search-command"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import type { Job } from "@/lib/seed-data"

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
    pageSize: 10,
    sort: "order",
  })
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  })
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: filters.search,
        status: filters.status,
        page: filters.page.toString(),
        pageSize: filters.pageSize.toString(),
        sort: filters.sort,
      })

      const response = await fetch(`/api/jobs?${params}`)
      if (!response.ok) throw new Error("Failed to fetch jobs")

      const data = await response.json()
      setJobs(data.jobs)
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
    fetchJobs()
  }, [filters.search, filters.status, filters.page, filters.pageSize, filters.sort])

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handleJobCreated = () => {
    setCreateDialogOpen(false)
    fetchJobs()
  }

  const handleJobUpdated = () => {
    fetchJobs()
  }
 
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Jobs</h1>
            <p className="text-muted-foreground">Manage your job postings and requirements</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setSearchOpen(true)} size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <JobFilters filters={filters} onFilterChange={handleFilterChange} loading={loading} />

          <JobsList
            jobs={jobs}
            loading={loading}
            error={error}
            pagination={pagination}
            currentPage={filters.page}
            onPageChange={handlePageChange}
            onJobUpdated={handleJobUpdated}
          />
        </div>

        <CreateJobDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onJobCreated={handleJobCreated} />
      </main>
    </div>
  )
}
