import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { Job } from "@/lib/seed-data"

interface EditJobDialogProps {
  job: Job | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onJobUpdated: () => void
}

export function EditJobDialog({ job, open, onOpenChange, onJobUpdated }: EditJobDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    type: "full-time" as "full-time" | "part-time" | "contract",
    requirements: [] as string[],
    tags: [] as string[],
    status: "active" as "active" | "archived",
  })
  const [newRequirement, setNewRequirement] = useState("")
  const [newTag, setNewTag] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        description: job.description || "",
        location: job.location || "",
        type: job.type || "full-time",
        requirements: job.requirements || [],
        tags: job.tags,
        status: job.status,
      })
    }
  }, [job])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = "Title is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").trim()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!job || !validateForm()) return

    try {
      setLoading(true)
      const slug = generateSlug(formData.title)

      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, slug }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update job")
      }

      setErrors({})
      onJobUpdated()
    } catch (error) {
      console.error(error)
      setErrors({ submit: error instanceof Error ? error.message : "Failed to update job" })
    } finally {
      setLoading(false)
    }
  }

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData((prev) => ({ ...prev, requirements: [...prev.requirements, newRequirement.trim()] }))
      setNewRequirement("")
    }
  }

  const removeRequirement = (req: string) =>
    setFormData((prev) => ({ ...prev, requirements: prev.requirements.filter((r) => r !== req) }))

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }))
      setNewTag("")
    }
  }

  const removeTag = (tag: string) =>
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))

  if (!job) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Senior Frontend Developer"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the role..."
              rows={4}
            />
          </div>

          {/* Location, Type, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Job Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "full-time" | "part-time" | "contract") =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "archived") =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label>Requirements</Label>
            <div className="flex gap-2">
              <Input
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Add a requirement..."
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
              />
              <Button type="button" onClick={addRequirement} variant="outline">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.requirements.map((r) => (
                <Badge key={r} variant="secondary" className="flex items-center gap-1">
                  {r}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeRequirement(r)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((t) => (
                <Badge key={t} variant="outline" className="flex items-center gap-1">
                  {t}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(t)} />
                </Badge>
              ))}
            </div>
          </div>

          {errors.submit && <p className="text-sm text-destructive">{errors.submit}</p>}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Updating..." : "Update Job"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
