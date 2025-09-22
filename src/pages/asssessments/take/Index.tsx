import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom" 
import { Navigation } from "@/components/layout/Navigation"
import { AssessmentForm } from "@/components/assessments/AssessmentForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Job, Assessment } from "@/lib/seed-data"

export default function TakeAssessmentPage() {
  const { jobId } = useParams() 
  const navigate = useNavigate() 
  const [job, setJob] = useState<Job | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch job
        const jobsResponse = await fetch("/api/jobs?search=&status=&page=1&pageSize=100&sort=order")
        if (!jobsResponse.ok) throw new Error("Failed to fetch jobs")
        const jobsData = await jobsResponse.json()
        const foundJob = jobsData.jobs.find((j: Job) => j.id === jobId)

        if (!foundJob) {
          setError("Job not found")
          return
        }
        setJob(foundJob)

        // Fetch assessment
        const assessmentResponse = await fetch(`/api/assessments/${jobId}`)
        if (!assessmentResponse.ok) throw new Error("Failed to fetch assessment")

        const data = await assessmentResponse.json()
        if (!data.assessment) {
          setError("No assessment found for this job")
          return
        }

        setAssessment(data.assessment)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      fetchData()
    }
  }, [jobId])

  const handleSubmit = async (responses: Record<string, any>) => {
    try {
      const response = await fetch(`/api/assessments/${jobId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: "demo-candidate", // In a real app, this would come from auth
          responses,
        }),
      })

      if (!response.ok) throw new Error("Failed to submit assessment")

      const result = await response.json()
      console.log("Assessment submitted:", result)

      // Redirect to success page or back to jobs
      navigate("/jobs") 
    } catch (error) {
      console.error("Failed to submit assessment:", error)
    }
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

  if (error || !job || !assessment) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate("/jobs")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-foreground mb-2">{error || "Assessment not found"}</h2>
            <p className="text-muted-foreground">
              The assessment you're looking for doesn't exist or hasn't been created yet.
            </p>
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

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">{assessment.title}</h1>
            <p className="text-lg text-muted-foreground mb-4">
              {job.title} - {job.location}
            </p>
            {assessment.description && <p className="text-muted-foreground">{assessment.description}</p>}
          </div>

          <AssessmentForm assessment={assessment} onSubmit={handleSubmit} />
        </div>
      </main>
    </div>
  )
}