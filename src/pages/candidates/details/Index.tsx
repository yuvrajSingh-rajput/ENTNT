import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Navigation } from "@/components/layout/Navigation"
import { CandidateProfile } from "@/components/candidates/CandidateProfile"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Candidate, TimelineEntry } from "@/lib/seed-data"

export default function CandidateDetailPage() {
  const { candidateId } = useParams()
  const navigate = useNavigate() 
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true)

        // Fetch candidate data
        const candidatesResponse = await fetch(`/api/candidates?search=&stage=&page=1&pageSize=1000`)
        if (!candidatesResponse.ok) throw new Error("Failed to fetch candidates")

        const candidatesData = await candidatesResponse.json()
        const foundCandidate = candidatesData.candidates.find((c: Candidate) => c.id === candidateId)

        if (!foundCandidate) {
          setError("Candidate not found")
          return
        }

        setCandidate(foundCandidate)

        // Fetch timeline
        const timelineResponse = await fetch(`/api/candidates/${candidateId}/timeline`)
        if (timelineResponse.ok) {
          const timelineData = await timelineResponse.json()
          setTimeline(timelineData.timeline)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (candidateId) {
      fetchCandidate()
    }
  }, [candidateId])

  const handleCandidateUpdated = (updatedCandidate: Candidate) => {
    setCandidate(updatedCandidate)
    // Refetch timeline to get latest changes
    fetch(`/api/candidates/${candidateId}/timeline`)
      .then((res) => res.json())
      .then((data) => setTimeline(data.timeline))
      .catch(console.error)
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

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate("/candidates")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Candidates
          </Button>
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-foreground mb-2">{error || "Candidate not found"}</h2>
            <p className="text-muted-foreground">The candidate you're looking for doesn't exist or has been removed.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/candidates")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Candidates
        </Button>

        <CandidateProfile candidate={candidate} timeline={timeline} onCandidateUpdated={handleCandidateUpdated} />
      </main>
    </div>
  )
}