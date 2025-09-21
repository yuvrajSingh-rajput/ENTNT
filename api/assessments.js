// api/assessments.js
import { DatabaseService } from '../src/lib/db';

export default async function handler(req, res) {
  const { method, body, url } = req;
  const jobId = url.split('/').pop(); // Extract jobId from /api/assessments/:jobId

  if (method === 'GET') {
    const data = await DatabaseService.getAssessment(jobId);
    return res.status(200).json(data);
  }

  if (method === 'PUT') {
    const assessmentData = body;
    const savedAssessment = await DatabaseService.saveAssessment(jobId, assessmentData);
    return res.status(200).json(savedAssessment);
  }

  if (method === 'POST') {
    const { candidateId, responses } = body;
    const result = await DatabaseService.submitAssessmentResponse(jobId, candidateId, responses);
    return res.status(201).json(result);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}