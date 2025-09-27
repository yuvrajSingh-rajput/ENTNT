import { setupWorker } from "msw/browser";
import { http, HttpResponse, delay } from "msw";
import { DatabaseService } from "./db";

// Simulate network latency and errors
const simulateNetworkConditions = async (isWrite: boolean = false) => {
  await delay(Math.random() * 1000 + 200); // 200–1200ms delay
  if (isWrite && Math.random() < 0.075) {
    // 7.5% error rate
    throw new Error("Network error");
  }
};

// Cache for search results
const searchCache = new Map<string, { results: any[]; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

// Cache for database initialization
let dbInitialized = false;

export const handlers = [
  // Jobs endpoints
  http.get("/api/jobs", async ({ request }) => {
    try {
      if (!dbInitialized) {
        await DatabaseService.initialize();
        dbInitialized = true;
      }
      await simulateNetworkConditions();
      const url = new URL(request.url);
      const search = url.searchParams.get("search") || "";
      const status = url.searchParams.get("status") || "";
      const page = Number.parseInt(url.searchParams.get("page") || "1");
      const pageSize = Number.parseInt(
        url.searchParams.get("pageSize") || "10"
      );
      const sort = url.searchParams.get("sort") || "order";
      const result = await DatabaseService.getJobs({
        search,
        status,
        page,
        pageSize,
        sort,
      });
      return HttpResponse.json(result);
    } catch (error) {
      console.error("API Error:", error);
      return HttpResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }),

  http.post("/api/jobs", async ({ request }) => {
    try {
      if (!dbInitialized) {
        await DatabaseService.initialize();
        dbInitialized = true;
      }
      await simulateNetworkConditions(true);
      const jobData = (await request.json()) as any;
      const newJob = await DatabaseService.createJob({
        ...jobData,
        order: Date.now(),
      });
      return HttpResponse.json(newJob, { status: 201 });
    } catch (error) {
      console.error("API Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Internal server error";
      const isBadRequest =
        error instanceof Error &&
        (error.message.includes("Slug") || error.message.includes("Title"));
      return HttpResponse.json(
        { error: errorMessage },
        { status: isBadRequest ? 400 : 500 }
      );
    }
  }),

  http.patch("/api/jobs/:id", async ({ params, request }) => {
    try {
      if (!dbInitialized) {
        await DatabaseService.initialize();
        dbInitialized = true;
      }
      await simulateNetworkConditions(true);
      const jobId = params.id as string;
      const updates = (await request.json()) as any;
      const updatedJob = await DatabaseService.updateJob(jobId, updates);
      if (!updatedJob) {
        return HttpResponse.json({ error: "Job not found" }, { status: 404 });
      }
      return HttpResponse.json(updatedJob);
    } catch (error) {
      console.error("API Error:", error);
      return HttpResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }),

  http.patch("/api/jobs/:id/reorder", async ({ params, request }) => {
    try {
      if (!dbInitialized) {
        await DatabaseService.initialize();
        dbInitialized = true;
      }
      if (Math.random() < 0.1) {
        return HttpResponse.json({ error: "Reorder failed" }, { status: 500 });
      }
      await simulateNetworkConditions(true);
      const jobId = params.id as string;
      const { fromOrder, toOrder } = (await request.json()) as any;
      const result = await DatabaseService.reorderJob(
        jobId,
        fromOrder,
        toOrder
      );
      return HttpResponse.json(result);
    } catch (error) {
      console.error("API Error:", error);
      return HttpResponse.json({ error: "Job not found" }, { status: 404 });
    }
  }),

  // Candidates endpoints
  http.get("/api/candidates", async ({ request }) => {
    try {
      if (!dbInitialized) {
        await DatabaseService.initialize();
        dbInitialized = true;
      }
      await simulateNetworkConditions();
      const url = new URL(request.url);
      const search = url.searchParams.get("search") || "";
      const stage = url.searchParams.get("stage") || "";
      const page = Number.parseInt(url.searchParams.get("page") || "1");
      const pageSize = Number.parseInt(
        url.searchParams.get("pageSize") || "50"
      );
      const result = await DatabaseService.getCandidates({
        search,
        stage,
        page,
        pageSize,
      });
      return HttpResponse.json(result);
    } catch (error) {
      console.error("API Error:", error);
      return HttpResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }),

  http.post("/api/candidates", async ({ request }) => {
    try {
      if (!dbInitialized) {
        await DatabaseService.initialize();
        dbInitialized = true;
      }
      await simulateNetworkConditions(true);
      const candidateData = (await request.json()) as any;
      const newCandidate = await DatabaseService.createCandidate(candidateData);
      return HttpResponse.json(newCandidate, { status: 201 });
    } catch (error) {
      console.error("API Error:", error);
      return HttpResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }),

  http.patch("/api/candidates/:id", async ({ params, request }) => {
    try {
      if (!dbInitialized) {
        await DatabaseService.initialize();
        dbInitialized = true;
      }
      await simulateNetworkConditions(true);
      const candidateId = params.id as string;
      const updates = (await request.json()) as any;
      const updatedCandidate = await DatabaseService.updateCandidate(
        candidateId,
        updates
      );
      if (!updatedCandidate) {
        return HttpResponse.json(
          { error: "Candidate not found" },
          { status: 404 }
        );
      }
      return HttpResponse.json(updatedCandidate);
    } catch (error) {
      console.error("API Error:", error);
      return HttpResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }),

  http.get("/api/candidates/:id/timeline", async ({ params }) => {
    try {
      if (!dbInitialized) {
        await DatabaseService.initialize();
        dbInitialized = true;
      }
      await simulateNetworkConditions();
      const candidateId = params.id as string;
      const result = await DatabaseService.getCandidateTimeline(candidateId);
      return HttpResponse.json(result);
    } catch (error) {
      console.error("API Error:", error);
      return HttpResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }),

  // Assessments endpoints
  http.get("/api/assessments/:jobId", async ({ params }) => {
    try {
      if (!dbInitialized) {
        await DatabaseService.initialize();
        dbInitialized = true;
      }
      await simulateNetworkConditions();
      const jobId = params.jobId as string;
      const result = await DatabaseService.getAssessment(jobId);
      return HttpResponse.json(result);
    } catch (error) {
      console.error("API Error:", error);
      return HttpResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }),

  http.put("/api/assessments/:jobId", async ({ params, request }) => {
    try {
      if (!dbInitialized) {
        await DatabaseService.initialize();
        dbInitialized = true;
      }
      await simulateNetworkConditions(true);
      const jobId = params.jobId as string;
      const assessmentData = (await request.json()) as any;
      const savedAssessment = await DatabaseService.saveAssessment(
        jobId,
        assessmentData
      );
      return HttpResponse.json(savedAssessment);
    } catch (error) {
      console.error("API Error:", error);
      return HttpResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }),

  http.post("/api/assessments/:jobId/submit", async ({ params, request }) => {
    try {
      if (!dbInitialized) {
        await DatabaseService.initialize();
        dbInitialized = true;
      }
      await simulateNetworkConditions(true);
      const jobId = params.jobId as string;
      const { candidateId, responses } = (await request.json()) as any;
      const result = await DatabaseService.submitAssessmentResponse(
        jobId,
        candidateId,
        responses
      );
      return HttpResponse.json(result, { status: 201 });
    } catch (error) {
      console.error("API Error:", error);
      return HttpResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }),

  // Search endpoint
  http.get("/api/search", async ({ request }) => {
    try {
      if (!dbInitialized) {
        await DatabaseService.initialize();
        dbInitialized = true;
      }
      await simulateNetworkConditions();
      const url = new URL(request.url);
      const query = url.searchParams.get("q") || "";

      if (!query.trim()) {
        return HttpResponse.json({ results: [] });
      }

      // Check cache first
      const cacheKey = query.toLowerCase();
      const cached = searchCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return HttpResponse.json({ results: cached.results });
      }

      // Search across jobs, candidates, and assessments in parallel
      const [jobs, candidates] = await Promise.all([
        DatabaseService.getJobs({ search: query, page: 1, pageSize: 10 }),
        DatabaseService.getCandidates({ search: query, page: 1, pageSize: 10 }),
      ]);

      // For assessments, search more efficiently
      const assessmentResults = [];
      try {
        // Get all jobs first, then search for assessments
        const allJobs = await DatabaseService.getJobs({
          search: "",
          page: 1,
          pageSize: 100,
        });
        const assessmentPromises = allJobs.jobs.map(async (job) => {
          try {
            const assessmentResult = await DatabaseService.getAssessment(
              job.id
            );
            const assessment = assessmentResult.assessment;
            if (
              assessment &&
              (assessment.title.toLowerCase().includes(query.toLowerCase()) ||
                (assessment.description &&
                  assessment.description
                    .toLowerCase()
                    .includes(query.toLowerCase())))
            ) {
              return {
                id: assessment.id,
                title: assessment.title,
                type: "assessment",
                description: `${job.title} • ${
                  assessment.sections?.length || 0
                } sections`,
                url: `/assessments/${job.id}/builder`,
              };
            }
          } catch (err) {
            // Assessment doesn't exist for this job
          }
          return null;
        });

        const assessmentData = await Promise.all(assessmentPromises);
        assessmentResults.push(...assessmentData.filter(Boolean));
      } catch (err) {
        console.error("Assessment search error:", err);
      }

      const results = [
        // Jobs
        ...jobs.jobs.map((job) => ({
          id: job.id,
          title: job.title,
          type: "job",
          description: `${job.location} • ${job.type}`,
          url: `/jobs/${job.id}`,
        })),
        // Candidates
        ...candidates.candidates.map((candidate) => ({
          id: candidate.id,
          title: candidate.name,
          type: "candidate",
          description: `${candidate.email} • ${candidate.stage}`,
          url: `/candidates/${candidate.id}`,
        })),
        // Assessments
        ...assessmentResults,
      ];

      // Cache the results
      searchCache.set(cacheKey, { results, timestamp: Date.now() });

      return HttpResponse.json({ results });
    } catch (error) {
      console.error("Search error:", error);
      return HttpResponse.json({ error: "Search failed" }, { status: 500 });
    }
  }),

  // DELETE endpoint
  http.delete("/api/*", async () => {
    return HttpResponse.json(
      { error: "Delete not implemented" },
      { status: 501 }
    );
  }),

  // Catch-all for unhandled endpoints
  http.all("/api/*", async () => {
    return HttpResponse.json({ error: "Endpoint not found" }, { status: 404 });
  }),
];

export const worker = setupWorker(...handlers);

export const initializeMSW = async () => {
  if (typeof window !== "undefined") {
    try {
      await worker.start({
        onUnhandledRequest: "bypass",
        serviceWorker: {
          url: "/mockServiceWorker.js",
        },
      });
      console.log("[MSW] Mock Service Worker started");
      return true;
    } catch (error) {
      console.error("[MSW] Failed to start Mock Service Worker:", error);
      return false;
    }
  }
  return false;
};

initializeMSW().catch((error) => {
  console.error("Failed to initialize MSW:", error);
});
