import Dexie, { type EntityTable } from "dexie"
import type { Job, Candidate, Assessment, TimelineEntry } from "./seed-data"

// Global flag to track if database is initialized
let dbInitialized = false

// Server-side data store for initial seeding and SSR
let serverDataStore: {
  jobs: Job[]
  candidates: Candidate[]
  assessments: Assessment[]
  timeline: TimelineEntry[]
  assessmentResponses: Array<{
    id: string
    jobId: string
    candidateId: string
    responses: Record<string, any>
    submittedAt: string
  }>
} | null = null

// Define the database schema
export interface TalentFlowDB extends Dexie {
  jobs: EntityTable<Job, "id">
  candidates: EntityTable<Candidate, "id">
  assessments: EntityTable<Assessment, "id">
  timeline: EntityTable<TimelineEntry, "id">
  assessmentResponses: EntityTable<
    {
      id: string
      jobId: string
      candidateId: string
      responses: Record<string, any>
      submittedAt: string
    },
    "id"
  >
}

// Create the database instance
export const db = new Dexie("TalentFlowDB") as TalentFlowDB

db.version(1).stores({
  jobs: "id, title, slug, status, order, createdAt, updatedAt",
  candidates: "id, name, email, stage, jobId, createdAt, updatedAt",
  assessments: "id, jobId, title, createdAt, updatedAt",
  timeline: "id, candidateId, timestamp",
  assessmentResponses: "id, jobId, candidateId, submittedAt",
})

// Database operations
export class DatabaseService {
  // Initialize database with seed data
  static async initialize() {
    // Initialize server-side data store for SSR and initial seeding
    if (typeof window === "undefined") {
      console.log("[DB] Initializing server-side data store for SSR")
      if (!serverDataStore) {
        const { seedData } = await import("./seed-data")
        // Convert timeline data from seed data
        const timelineEntries: TimelineEntry[] = []
        Object.values(seedData.candidateTimeline).forEach(candidateTimeline => {
          timelineEntries.push(...candidateTimeline)
        })
        
        serverDataStore = {
          jobs: [...seedData.jobs],
          candidates: [...seedData.candidates],
          assessments: Object.values(seedData.assessments),
          timeline: timelineEntries,
          assessmentResponses: []
        }
      }
      return
    }

    if (dbInitialized) {
      return
    }

    try {
      // Check if data already exists
      const jobCount = await db.jobs.count()
      if (jobCount > 0) {
        console.log("[DB] Database already initialized")
        return
      }

      console.log("[DB] Initializing database with seed data...")

      // Import seed data dynamically to avoid circular dependencies
      const { seedData } = await import("./seed-data")

      // Convert timeline data from seed data
      const timelineEntries: TimelineEntry[] = []
      Object.values(seedData.candidateTimeline).forEach(candidateTimeline => {
        timelineEntries.push(...candidateTimeline)
      })

      // Add seed data to IndexedDB
      await db.transaction("rw", [db.jobs, db.candidates, db.assessments, db.timeline], async () => {
        await db.jobs.bulkAdd(seedData.jobs)
        await db.candidates.bulkAdd(seedData.candidates)

        // Add assessments
        const assessmentArray = Object.values(seedData.assessments)
        if (assessmentArray.length > 0) {
          await db.assessments.bulkAdd(assessmentArray)
        }

        // Add timeline entries
        if (timelineEntries.length > 0) {
          await db.timeline.bulkAdd(timelineEntries)
        }
      })

      console.log("[DB] Database initialized successfully")
      dbInitialized = true
    } catch (error) {
      console.error("[DB] Failed to initialize database:", error)
    }
  }

  // Jobs operations
  static async getJobs(
    filters: {
      search?: string
      status?: string
      page?: number
      pageSize?: number
      sort?: string
    } = {},
  ) {
    // Use server-side data store for SSR
    if (typeof window === "undefined") {
      if (!serverDataStore) {
        await this.initialize()
      }
      
      let jobs = [...serverDataStore!.jobs]

      // Apply sorting
      if (filters.sort === "title") {
        jobs.sort((a, b) => a.title.localeCompare(b.title))
      } else {
        jobs.sort((a, b) => (a.order || 0) - (b.order || 0))
      }

      // Apply filters
      if (filters.search) {
        jobs = jobs.filter(
          (job) =>
            job.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
            job.tags.some((tag) => tag.toLowerCase().includes(filters.search!.toLowerCase())),
        )
      }

      if (filters.status && filters.status !== "all") {
        jobs = jobs.filter((job) => job.status === filters.status)
      }

      const total = jobs.length
      const page = filters.page || 1
      const pageSize = filters.pageSize || 10
      const startIndex = (page - 1) * pageSize
      const paginatedJobs = jobs.slice(startIndex, startIndex + pageSize)

      return {
        jobs: paginatedJobs,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    }

    await this.initialize()

    try {
      let collection = db.jobs.orderBy(filters.sort === "title" ? "title" : "order")

      // Apply filters
      if (filters.search) {
        collection = collection.filter(
          (job) =>
            job.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
            job.tags.some((tag) => tag.toLowerCase().includes(filters.search!.toLowerCase())),
        )
      }

      if (filters.status && filters.status !== "all") {
        collection = collection.filter((job) => job.status === filters.status)
      }

      const jobs = await collection.toArray()
      const total = jobs.length

      // Apply pagination
      const page = filters.page || 1
      const pageSize = filters.pageSize || 10
      const startIndex = (page - 1) * pageSize
      const paginatedJobs = jobs.slice(startIndex, startIndex + pageSize)

      return {
        jobs: paginatedJobs,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    } catch (error) {
      console.error("[DB] Failed to get jobs:", error)
      throw error
    }
  }

  static async createJob(jobData: Omit<Job, "id" | "createdAt" | "updatedAt">) {
    const newJob: Job = {
      ...jobData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Handle server-side creation (for SSR)
    if (typeof window === "undefined") {
      if (!serverDataStore) {
        await this.initialize()
      }
      
      serverDataStore!.jobs.push(newJob)
      return newJob
    }

    // Browser-side creation (write to IndexedDB)
    await this.initialize()

    try {
      await db.jobs.add(newJob)
      return newJob
    } catch (error) {
      console.error("[DB] Failed to create job:", error)
      throw error
    }
  }

  static async updateJob(id: string, updates: Partial<Job>) {
    if (typeof window === "undefined") {
      throw new Error("Database operations only available in browser environment")
    }

    await this.initialize()

    try {
      const updatedJob = {
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      await db.jobs.update(id, updatedJob)
      return await db.jobs.get(id)
    } catch (error) {
      console.error("[DB] Failed to update job:", error)
      throw error
    }
  }

  static async reorderJob(id: string, fromOrder: number, toOrder: number) {
    if (typeof window === "undefined") {
      throw new Error("Database operations only available in browser environment")
    }

    await this.initialize()

    try {
      await db.transaction("rw", db.jobs, async () => {
        const job = await db.jobs.get(id)
        if (!job) throw new Error("Job not found")

        // Update the dragged job's order
        await db.jobs.update(id, { order: toOrder })

        // Adjust other jobs' orders
        const jobs = await db.jobs.toArray()
        for (const j of jobs) {
          if (j.id !== id) {
            if (fromOrder < toOrder && j.order > fromOrder && j.order <= toOrder) {
              await db.jobs.update(j.id, { order: j.order - 1 })
            } else if (fromOrder > toOrder && j.order >= toOrder && j.order < fromOrder) {
              await db.jobs.update(j.id, { order: j.order + 1 })
            }
          }
        }
      })

      return { success: true }
    } catch (error) {
      console.error("[DB] Failed to reorder job:", error)
      throw error
    }
  }

  // Candidates operations
  static async getCandidates(
    filters: {
      search?: string
      stage?: string
      page?: number
      pageSize?: number
    } = {},
  ) {
    // Use server-side data store for SSR
    if (typeof window === "undefined") {
      if (!serverDataStore) {
        await this.initialize()
      }
      
      let candidates = serverDataStore!.candidates

      // Apply filters
      if (filters.search) {
        candidates = candidates.filter(
          (candidate) =>
            candidate.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
            candidate.email.toLowerCase().includes(filters.search!.toLowerCase()),
        )
      }

      if (filters.stage && filters.stage !== "all") {
        candidates = candidates.filter((candidate) => candidate.stage === filters.stage)
      }

      const total = candidates.length
      const page = filters.page || 1
      const pageSize = filters.pageSize || 50
      const startIndex = (page - 1) * pageSize
      const paginatedCandidates = candidates.slice(startIndex, startIndex + pageSize)

      return {
        candidates: paginatedCandidates,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    }

    await this.initialize()

    try {
      let collection = db.candidates.orderBy("createdAt").reverse()

      // Apply filters
      if (filters.search) {
        collection = collection.filter(
          (candidate) =>
            candidate.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
            candidate.email.toLowerCase().includes(filters.search!.toLowerCase()),
        )
      }

      if (filters.stage && filters.stage !== "all") {
        collection = collection.filter((candidate) => candidate.stage === filters.stage)
      }

      const candidates = await collection.toArray()
      const total = candidates.length

      // Apply pagination
      const page = filters.page || 1
      const pageSize = filters.pageSize || 50
      const startIndex = (page - 1) * pageSize
      const paginatedCandidates = candidates.slice(startIndex, startIndex + pageSize)

      return {
        candidates: paginatedCandidates,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    } catch (error) {
      console.error("[DB] Failed to get candidates:", error)
      throw error
    }
  }

  static async createCandidate(candidateData: Omit<Candidate, "id" | "createdAt" | "updatedAt">) {
    const newCandidate: Candidate = {
      ...candidateData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Handle server-side creation (for SSR)
    if (typeof window === "undefined") {
      if (!serverDataStore) {
        await this.initialize()
      }
      
      serverDataStore!.candidates.push(newCandidate)
      return newCandidate
    }

    // Browser-side creation (write to IndexedDB)
    await this.initialize()

    try {
      await db.candidates.add(newCandidate)
      return newCandidate
    } catch (error) {
      console.error("[DB] Failed to create candidate:", error)
      throw error
    }
  }

  static async updateCandidate(id: string, updates: Partial<Candidate>) {
    // Handle server-side updates (for SSR)
    if (typeof window === "undefined") {
      if (!serverDataStore) {
        await this.initialize()
      }
      
      const candidateIndex = serverDataStore!.candidates.findIndex(c => c.id === id)
      if (candidateIndex === -1) throw new Error("Candidate not found")

      const candidate = serverDataStore!.candidates[candidateIndex]
      const oldStage = candidate.stage
      
      // Update candidate
      serverDataStore!.candidates[candidateIndex] = {
        ...candidate,
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      // Add timeline entry for stage changes
      if (updates.stage && updates.stage !== oldStage) {
        const timelineEntry: TimelineEntry = {
          id: Date.now().toString(),
          candidateId: id,
          action: "stage_change",
          fromStage: oldStage,
          toStage: updates.stage,
          timestamp: new Date().toISOString(),
          notes: (updates as any).notes || "",
        }

        serverDataStore!.timeline.push(timelineEntry)
      }

      // Add timeline entry for standalone notes (when no stage change)
      if ((updates as any).notes && (!updates.stage || updates.stage === oldStage)) {
        const timelineEntry: TimelineEntry = {
          id: (Date.now() + 1).toString(), // Ensure unique ID
          candidateId: id,
          action: "note_added",
          timestamp: new Date().toISOString(),
          notes: (updates as any).notes,
        }

        serverDataStore!.timeline.push(timelineEntry)
      }

      return serverDataStore!.candidates[candidateIndex]
    }

    // Browser-side updates (write to IndexedDB)
    await this.initialize()

    try {
      const candidate = await db.candidates.get(id)
      if (!candidate) throw new Error("Candidate not found")

      const oldStage = candidate.stage
      const updatedCandidate = {
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      await db.candidates.update(id, updatedCandidate)

      // Add timeline entry for stage changes
      if (updates.stage && updates.stage !== oldStage) {
        const timelineEntry: TimelineEntry = {
          id: Date.now().toString(),
          candidateId: id,
          action: "stage_change",
          fromStage: oldStage,
          toStage: updates.stage,
          timestamp: new Date().toISOString(),
          notes: (updates as any).notes || "",
        }

        await db.timeline.add(timelineEntry)
      }

      // Add timeline entry for standalone notes (when no stage change)
      if ((updates as any).notes && (!updates.stage || updates.stage === oldStage)) {
        const timelineEntry: TimelineEntry = {
          id: (Date.now() + 1).toString(), // Ensure unique ID
          candidateId: id,
          action: "note_added",
          timestamp: new Date().toISOString(),
          notes: (updates as any).notes,
        }

        await db.timeline.add(timelineEntry)
      }

      return await db.candidates.get(id)
    } catch (error) {
      console.error("[DB] Failed to update candidate:", error)
      throw error
    }
  }

  static async getCandidateTimeline(candidateId: string) {
    // Use server-side data store for SSR
    if (typeof window === "undefined") {
      if (!serverDataStore) {
        await this.initialize()
      }
      
      const timeline = serverDataStore!.timeline
        .filter(entry => entry.candidateId === candidateId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      return { timeline }
    }

    // Browser-side timeline retrieval
    await this.initialize()

    try {
      const timeline = await db.timeline
        .where("candidateId")
        .equals(candidateId)
        .toArray()
      
      // Sort by timestamp in descending order
      timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      return { timeline }
    } catch (error) {
      console.error("[DB] Failed to get candidate timeline:", error)
      throw error
    }
  }

  // Assessments operations
  static async getAssessment(jobId: string) {
    // Use server-side data store for SSR
    if (typeof window === "undefined") {
      if (!serverDataStore) {
        await this.initialize()
      }
      
      const assessment = serverDataStore!.assessments.find(a => a.jobId === jobId) || null
      return { assessment }
    }

    await this.initialize()

    try {
      const assessment = await db.assessments.where("jobId").equals(jobId).first()
      return { assessment: assessment || null }
    } catch (error) {
      console.error("[DB] Failed to get assessment:", error)
      throw error
    }
  }

  static async saveAssessment(jobId: string, assessmentData: Assessment) {
    const assessment = {
      ...assessmentData,
      jobId,
      updatedAt: new Date().toISOString(),
    }

    // Handle server-side saves (for SSR)
    if (typeof window === "undefined") {
      if (!serverDataStore) {
        await this.initialize()
      }
      
      const existingIndex = serverDataStore!.assessments.findIndex(a => a.jobId === jobId)
      if (existingIndex >= 0) {
        serverDataStore!.assessments[existingIndex] = assessment
      } else {
        serverDataStore!.assessments.push(assessment)
      }
      
      return assessment
    }

    // Browser-side saves (write to IndexedDB)
    await this.initialize()

    try {
      await db.assessments.put(assessment)
      return assessment
    } catch (error) {
      console.error("[DB] Failed to save assessment:", error)
      throw error
    }
  }

  static async submitAssessmentResponse(jobId: string, candidateId: string, responses: Record<string, any>) {
    const submission = {
      id: Date.now().toString(),
      jobId,
      candidateId,
      responses,
      submittedAt: new Date().toISOString(),
    }

    // Handle server-side submissions (for SSR)
    if (typeof window === "undefined") {
      if (!serverDataStore) {
        await this.initialize()
      }
      
      serverDataStore!.assessmentResponses.push(submission)
      return { submissionId: submission.id }
    }

    // Browser-side submissions (write to IndexedDB)
    await this.initialize()

    try {
      await db.assessmentResponses.add(submission)
      return { submissionId: submission.id }
    } catch (error) {
      console.error("[DB] Failed to submit assessment response:", error)
      throw error
    }
  }

  // Utility methods
  static async clearAllData() {
    try {
      await db.transaction(
        "rw",
        [db.jobs, db.candidates, db.assessments, db.timeline, db.assessmentResponses],
        async () => {
          await db.jobs.clear()
          await db.candidates.clear()
          await db.assessments.clear()
          await db.timeline.clear()
          await db.assessmentResponses.clear()
        },
      )
      console.log("[DB] All data cleared")
    } catch (error) {
      console.error("[DB] Failed to clear data:", error)
      throw error
    }
  }

  static async exportData() {
    try {
      const data = {
        jobs: await db.jobs.toArray(),
        candidates: await db.candidates.toArray(),
        assessments: await db.assessments.toArray(),
        timeline: await db.timeline.toArray(),
        assessmentResponses: await db.assessmentResponses.toArray(),
      }
      return data
    } catch (error) {
      console.error("[DB] Failed to export data:", error)
      throw error
    }
  }
}

// Initialize database when module loads (server-side)
if (typeof window !== "undefined") {
  DatabaseService.initialize()
}