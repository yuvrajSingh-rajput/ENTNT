// api/search.js
import { DatabaseService } from '../src/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { q = '' } = req.query;
    const [jobs, candidates] = await Promise.all([
      DatabaseService.getJobs({ search: q, page: 1, pageSize: 10 }),
      DatabaseService.getCandidates({ search: q, page: 1, pageSize: 10 }),
    ]);

    const assessmentResults = [];
    const allJobs = await DatabaseService.getJobs({ search: "", page: 1, pageSize: 100 });
    for (const job of allJobs.jobs) {
      const assessmentResult = await DatabaseService.getAssessment(job.id);
      const assessment = assessmentResult.assessment;
      if (assessment && (assessment.title.toLowerCase().includes(q.toLowerCase()) || (assessment.description && assessment.description.toLowerCase().includes(q.toLowerCase())))) {
        assessmentResults.push({
          id: assessment.id,
          title: assessment.title,
          type: "assessment",
          description: `${job.title} • ${assessment.sections?.length || 0} sections`,
          url: `/assessments/${job.id}/builder`,
        });
      }
    }

    const results = [
      ...jobs.jobs.map(job => ({ id: job.id, title: job.title, type: "job", description: `${job.location} • ${job.type}`, url: `/jobs/${job.id}` })),
      ...candidates.candidates.map(candidate => ({ id: candidate.id, title: candidate.name, type: "candidate", description: `${candidate.email} • ${candidate.stage}`, url: `/candidates/${candidate.id}` })),
      ...assessmentResults,
    ];

    return res.status(200).json({ results });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}