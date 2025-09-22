import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom" 
import { Navigation } from "@/components/layout/Navigation"
import { AssessmentsList } from "@/components/assessments/AssessmentsList"
import { SearchCommand } from "@/components/ui/search-command"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import type { Job, Assessment } from "@/lib/seed-data"

export default function AssessmentsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [assessments, setAssessments] = useState<Record<string, Assessment>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch jobs first (faster)
        const jobsResponse = await fetch("/api/jobs?search=&status=active&page=1&pageSize=100&sort=order")
        if (!jobsResponse.ok) throw new Error("Failed to fetch jobs")
        const jobsData = await jobsResponse.json()
        setJobs(jobsData.jobs)

        // Show jobs immediately, then load assessments in background
        setLoading(false)

        // Fetch assessments in batches to avoid overwhelming the API
        const batchSize = 5
        const assessmentPromises = []
        
        for (let i = 0; i < jobsData.jobs.length; i += batchSize) {
          const batch = jobsData.jobs.slice(i, i + batchSize)
          const batchPromises = batch.map(async (job: Job) => {
            try {
              const assessmentResponse = await fetch(`/api/assessments/${job.id}`)
              if (assessmentResponse.ok) {
                const data = await assessmentResponse.json()
                return { jobId: job.id, assessment: data.assessment }
              }
              return { jobId: job.id, assessment: null }
            } catch (err) {
              console.error(`Failed to fetch assessment for job ${job.id}:`, err)
              return { jobId: job.id, assessment: null }
            }
          })
          assessmentPromises.push(Promise.all(batchPromises))
        }

        // Process all batches
        const allBatches = await Promise.all(assessmentPromises)
        const assessmentsData: Record<string, Assessment> = {}
        
        allBatches.flat().forEach(({ jobId, assessment }) => {
          if (assessment) {
            assessmentsData[jobId] = assessment
          }
        })
        
        setAssessments(assessmentsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCreateAssessment = (jobId: string) => {
    navigate(`/assessments/${jobId}/builder`) 
  }

  const handleEditAssessment = (jobId: string) => {
    navigate(`/assessments/${jobId}/builder`) 
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Assessments</h1>
            <p className="text-muted-foreground">Create and manage job-specific assessments and quizzes</p>
          </div>
          <Button variant="outline" onClick={() => setSearchOpen(true)} size="sm">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        <AssessmentsList
          jobs={jobs}
          assessments={assessments}
          loading={loading}
          error={error}
          onCreateAssessment={handleCreateAssessment}
          onEditAssessment={handleEditAssessment}
        />
      </main>
    </div>
  )
}