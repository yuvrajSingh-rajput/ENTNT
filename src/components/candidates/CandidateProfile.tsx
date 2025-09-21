import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, Calendar, MessageSquare, ArrowRight } from "lucide-react"
import type { Candidate, TimelineEntry } from "@/lib/seed-data"

interface CandidateProfileProps {
  candidate: Candidate
  timeline: TimelineEntry[]
  onCandidateUpdated: (candidate: Candidate) => void
}

const stages = [
  { value: "applied", label: "Applied" },
  { value: "screen", label: "Screening" },
  { value: "tech", label: "Technical" },
  { value: "offer", label: "Offer" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
]

const stageColors = {
  applied: "bg-blue-100 text-blue-800",
  screen: "bg-yellow-100 text-yellow-800",
  tech: "bg-purple-100 text-purple-800",
  offer: "bg-green-100 text-green-800",
  hired: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
}

export function CandidateProfile({ candidate, timeline, onCandidateUpdated }: CandidateProfileProps) {
  const [stageNote, setStageNote] = useState("")
  const [standaloneNote, setStandaloneNote] = useState("")
  const [newStage, setNewStage] = useState(candidate.stage)
  const [loading, setLoading] = useState(false)

  const initials = candidate.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const handleStageChange = async () => {
    if (newStage === candidate.stage && !stageNote.trim()) return

    try {
      setLoading(true)
      const response = await fetch(`/api/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: newStage,
          notes: stageNote.trim() || undefined,
        }),
      })

      if (!response.ok) throw new Error("Failed to update candidate")

      const updatedCandidate = await response.json()
      onCandidateUpdated(updatedCandidate)
      setStageNote("")
    } catch (error) {
      console.error("Failed to update candidate:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!standaloneNote.trim()) return

    try {
      setLoading(true)
      const response = await fetch(`/api/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: standaloneNote.trim(),
        }),
      })

      if (!response.ok) throw new Error("Failed to add note")

      const updatedCandidate = await response.json()
      onCandidateUpdated(updatedCandidate)
      setStandaloneNote("")
    } catch (error) {
      console.error("Failed to add note:", error)
    } finally {
      setLoading(false)
    }
  }

  // Simple @mention detection (just highlights @username patterns)
  const renderTextWithMentions = (text: string) => {
    const mentionRegex = /@(\w+)/g
    const parts = text.split(mentionRegex)

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a mention
        return (
          <span key={index} className="bg-primary/10 text-primary px-1 rounded">
            @{part}
          </span>
        )
      }
      return part
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Candidate Info */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{candidate.name}</CardTitle>
                <Badge className={`mt-2 ${stageColors[candidate.stage]} border-0`}>
                  {stages.find((s) => s.value === candidate.stage)?.label}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{candidate.email}</span>
            </div>
            {candidate.phone && (
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{candidate.phone}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Applied {new Date(candidate.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Stage Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Update Stage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={newStage} onValueChange={(value) => setNewStage(value as Candidate["stage"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Add a note about this stage change (optional)..."
              value={stageNote}
              onChange={(e) => setStageNote(e.target.value)}
              rows={3}
            />

            <Button onClick={handleStageChange} disabled={loading || (newStage === candidate.stage && !stageNote.trim())} className="w-full">
              {loading ? "Updating..." : "Update Stage"}
            </Button>
          </CardContent>
        </Card>

        {/* Add Note */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Add a note... Use @username to mention team members"
              value={standaloneNote}
              onChange={(e) => setStandaloneNote(e.target.value)}
              rows={4}
            />
            <Button onClick={handleAddNote} disabled={loading || !standaloneNote.trim()} className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              {loading ? "Adding..." : "Add Note"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No timeline entries yet. Stage changes and notes will appear here.
              </p>
            ) : (
              <div className="space-y-4">
                {timeline.map((entry) => (
                  <div key={entry.id} className="flex space-x-4 pb-4 border-b border-border last:border-b-0">
                    <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {entry.action === "stage_change" && (
                          <>
                            <span className="text-sm font-medium">Stage changed</span>
                            {entry.fromStage && entry.toStage && (
                              <div className="flex items-center space-x-1 text-xs">
                                <Badge variant="outline" className="text-xs">
                                  {stages.find((s) => s.value === entry.fromStage)?.label}
                                </Badge>
                                <ArrowRight className="h-3 w-3" />
                                <Badge variant="outline" className="text-xs">
                                  {stages.find((s) => s.value === entry.toStage)?.label}
                                </Badge>
                              </div>
                            )}
                          </>
                        )}
                        {entry.action === "note_added" && (
                          <span className="text-sm font-medium">Note added</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                      {entry.notes && (
                        <div className="text-sm text-foreground bg-muted p-3 rounded-md">
                          {renderTextWithMentions(entry.notes)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
