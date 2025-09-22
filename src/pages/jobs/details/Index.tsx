import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom" 
import { Navigation } from "@/components/layout/Navigation"
import { JobDetails } from "@/components/jobs/JobDetails"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Job } from "@/lib/seed-data"

export default function JobDetailPage() {
  const { jobId } = useParams() 
  const navigate = useNavigate() 
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/jobs?search=&status=&page=1&pageSize=100&sort=order`)
        if (!response.ok) throw new Error("Failed to fetch jobs")

        const data = await response.json()
        const foundJob = data.jobs.find((j: Job) => j.id === jobId)

        if (!foundJob) {
          setError("Job not found")
          return
        }

        setJob(foundJob)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      fetchJob()
    }
  }, [jobId])

  const handleJobUpdated = (updatedJob: Job) => {
    setJob(updatedJob)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-24 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate("/jobs")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-foreground mb-2">{error || "Job not found"}</h2>
            <p className="text-muted-foreground">The job you're looking for doesn't exist or has been removed.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/jobs")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        <JobDetails job={job} onJobUpdated={handleJobUpdated} />
      </main>
    </div>
  )
}