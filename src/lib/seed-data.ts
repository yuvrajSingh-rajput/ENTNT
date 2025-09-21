// Seed data for the application
export interface Job {
  id: string
  title: string
  slug: string
  status: "active" | "archived"
  tags: string[]
  order: number
  description?: string
  requirements?: string[]
  location?: string
  type?: "full-time" | "part-time" | "contract"
  createdAt: string
  updatedAt: string
}

export interface Candidate {
  id: string
  name: string
  email: string
  stage: "applied" | "screen" | "tech" | "offer" | "hired" | "rejected"
  jobId: string
  phone?: string
  resume?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Assessment {
  id: string
  jobId: string
  title: string
  description: string
  sections: AssessmentSection[]
  createdAt: string
  updatedAt: string
}

export interface AssessmentSection {
  id: string
  title: string
  description?: string
  questions: AssessmentQuestion[]
}

export interface AssessmentQuestion {
  id: string
  type: "single-choice" | "multi-choice" | "short-text" | "long-text" | "numeric" | "file-upload"
  question: string
  required: boolean
  options?: string[]
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
  }
  conditionalLogic?: {
    dependsOn: string
    condition: string
    value: string
  }
}

export interface TimelineEntry {
  id: string
  candidateId: string
  action: string
  fromStage?: string
  toStage?: string
  timestamp: string
  notes?: string
}

// Generate seed data
const generateJobs = (): Job[] => {
  const jobTitles = [
    "Senior Frontend Developer",
    "Backend Engineer",
    "Full Stack Developer",
    "DevOps Engineer",
    "Product Manager",
    "UX Designer",
    "Data Scientist",
    "Mobile Developer",
    "QA Engineer",
    "Technical Lead",
    "Software Architect",
    "Marketing Manager",
    "Sales Representative",
    "Customer Success Manager",
    "HR Specialist",
    "Financial Analyst",
    "Operations Manager",
    "Content Writer",
    "Graphic Designer",
    "Business Analyst",
    "Project Manager",
    "Security Engineer",
    "Machine Learning Engineer",
    "Cloud Engineer",
    "Site Reliability Engineer",
  ]

  const tags = ["Remote", "On-site", "Hybrid", "Senior", "Junior", "Mid-level", "Urgent", "New"]
  const locations = ["New York", "San Francisco", "London", "Berlin", "Toronto", "Remote"]
  const types: ("full-time" | "part-time" | "contract")[] = ["full-time", "part-time", "contract"]

  return jobTitles.map((title, index) => ({
    id: (index + 1).toString(),
    title,
    slug: title.toLowerCase().replace(/\s+/g, "-"),
    status: Math.random() > 0.3 ? "active" : ("archived" as "active" | "archived"),
    tags: tags.slice(0, Math.floor(Math.random() * 3) + 1),
    order: index + 1,
    description: `We are looking for a talented ${title} to join our growing team.`,
    requirements: ["3+ years of experience", "Strong communication skills", "Team player", "Problem-solving abilities"],
    location: locations[Math.floor(Math.random() * locations.length)],
    type: types[Math.floor(Math.random() * types.length)],
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }))
}

const generateCandidates = (jobs: Job[]): Candidate[] => {
  const firstNames = [
    "John",
    "Jane",
    "Michael",
    "Sarah",
    "David",
    "Emily",
    "Robert",
    "Lisa",
    "James",
    "Maria",
    "William",
    "Jennifer",
    "Richard",
    "Linda",
    "Joseph",
    "Elizabeth",
    "Thomas",
    "Barbara",
    "Christopher",
    "Susan",
    "Daniel",
    "Jessica",
    "Matthew",
    "Karen",
    "Anthony",
    "Nancy",
  ]

  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
    "Lee",
    "Perez",
    "Thompson",
    "White",
    "Harris",
    "Sanchez",
  ]

  const stages: Candidate["stage"][] = ["applied", "screen", "tech", "offer", "hired", "rejected"]

  const candidates: Candidate[] = []

  for (let i = 0; i < 1000; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const jobId = jobs[Math.floor(Math.random() * jobs.length)].id

    candidates.push({
      id: (i + 1).toString(),
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      stage: stages[Math.floor(Math.random() * stages.length)],
      jobId,
      phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  return candidates
}

const generateAssessments = (jobs: Job[]): Record<string, Assessment> => {
  const assessments: Record<string, Assessment> = {}

  // Create assessments for first 3 jobs
  jobs.slice(0, 3).forEach((job, _) => {
    assessments[job.id] = {
      id: `assessment-${job.id}`,
      jobId: job.id,
      title: `${job.title} Assessment`,
      description: `Technical assessment for ${job.title} position`,
      sections: [
        {
          id: `section-1-${job.id}`,
          title: "Technical Skills",
          description: "Evaluate technical competencies",
          questions: [
            {
              id: `q1-${job.id}`,
              type: "single-choice",
              question: "How many years of experience do you have?",
              required: true,
              options: ["0-1 years", "2-3 years", "4-5 years", "6+ years"],
            },
            {
              id: `q2-${job.id}`,
              type: "multi-choice",
              question: "Which technologies are you proficient in?",
              required: true,
              options: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "Java"],
            },
            {
              id: `q3-${job.id}`,
              type: "long-text",
              question: "Describe a challenging project you worked on.",
              required: true,
              validation: { minLength: 100, maxLength: 1000 },
            },
          ],
        },
        {
          id: `section-2-${job.id}`,
          title: "Problem Solving",
          questions: [
            {
              id: `q4-${job.id}`,
              type: "short-text",
              question: "What is your preferred programming language?",
              required: false,
              validation: { maxLength: 50 },
            },
            {
              id: `q5-${job.id}`,
              type: "numeric",
              question: "Rate your problem-solving skills (1-10)",
              required: true,
              validation: { min: 1, max: 10 },
            },
            {
              id: `q6-${job.id}`,
              type: "single-choice",
              question: "Are you available for remote work?",
              required: true,
              options: ["Yes", "No", "Hybrid preferred"],
            },
            {
              id: `q7-${job.id}`,
              type: "short-text",
              question: "If yes, what is your preferred remote work setup?",
              required: false,
              conditionalLogic: {
                dependsOn: `q6-${job.id}`,
                condition: "equals",
                value: "Yes",
              },
            },
          ],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  })

  return assessments
}

// Generate timeline entries for candidates
const generateCandidateTimeline = (candidates: Candidate[]): Record<string, TimelineEntry[]> => {
  const timeline: Record<string, TimelineEntry[]> = {}
  
  candidates.forEach((candidate) => {
    const candidateTimeline: TimelineEntry[] = []
    
    // Add initial application entry
    candidateTimeline.push({
      id: `${candidate.id}-initial`,
      candidateId: candidate.id,
      action: "stage_change",
      toStage: "applied",
      timestamp: candidate.createdAt,
      notes: "Candidate applied for the position"
    })
    
    // Add some random timeline entries based on current stage
    const stageOrder = ["applied", "screen", "tech", "offer", "hired", "rejected"]
    const currentStageIndex = stageOrder.indexOf(candidate.stage)
    
    // Add progression through stages
    for (let i = 1; i <= currentStageIndex; i++) {
      const fromStage = stageOrder[i - 1]
      const toStage = stageOrder[i]
      
      // Add some time between stages (1-7 days)
      const timeOffset = i * (24 * 60 * 60 * 1000) + Math.random() * (7 * 24 * 60 * 60 * 1000)
      const timestamp = new Date(new Date(candidate.createdAt).getTime() + timeOffset).toISOString()
      
      const notes = [
        `Moved to ${toStage} stage`,
        `Progressing to ${toStage}`,
        `Advanced to ${toStage} phase`,
        `Updated status to ${toStage}`
      ][Math.floor(Math.random() * 4)]
      
      candidateTimeline.push({
        id: `${candidate.id}-${i}`,
        candidateId: candidate.id,
        action: "stage_change",
        fromStage,
        toStage,
        timestamp,
        notes
      })
    }
    
    // Add some random notes
    if (Math.random() > 0.5) {
      const noteTime = new Date(new Date(candidate.createdAt).getTime() + Math.random() * (30 * 24 * 60 * 60 * 1000)).toISOString()
      const noteTexts = [
        "Great communication skills during interview",
        "Strong technical background",
        "Good cultural fit for the team",
        "Needs to improve on specific areas",
        "Excellent problem-solving approach",
        "Follow up on reference checks",
        "Schedule next round of interviews"
      ]
      
      candidateTimeline.push({
        id: `${candidate.id}-note-${Date.now()}`,
        candidateId: candidate.id,
        action: "note_added",
        timestamp: noteTime,
        notes: noteTexts[Math.floor(Math.random() * noteTexts.length)]
      })
    }
    
    timeline[candidate.id] = candidateTimeline.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  })
  
  return timeline
}

// Initialize seed data
const jobs = generateJobs()
const candidates = generateCandidates(jobs)
const assessments = generateAssessments(jobs)
const candidateTimeline = generateCandidateTimeline(candidates)

export const seedData = {
  jobs,
  candidates,
  assessments,
  candidateTimeline,
  assessmentResponses: {} as Record<string, any[]>,
}