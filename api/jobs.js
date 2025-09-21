// api/jobs.js
import { DatabaseService } from '../src/lib/db';

export default async function handler(req, res) {
  const { method, query, body, url } = req;
  const params = new URLSearchParams(query);

  if (method === 'GET') {
    const search = params.get('search') || '';
    const status = params.get('status') || '';
    const page = parseInt(params.get('page') || '1');
    const pageSize = parseInt(params.get('pageSize') || '10');
    const sort = params.get('sort') || 'order';
    const data = await DatabaseService.getJobs({ search, status, page, pageSize, sort });
    return res.status(200).json(data);
  }

  if (method === 'POST') {
    const jobData = body;
    const newJob = await DatabaseService.createJob(jobData);
    return res.status(201).json(newJob);
  }

  if (method === 'PATCH') {
    const id = url.split('/').pop(); // Extract id from /api/jobs/:id
    const updates = body;
    const updatedJob = await DatabaseService.updateJob(id, updates);
    if (!updatedJob) return res.status(404).json({ error: 'Job not found' });
    return res.status(200).json(updatedJob);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}