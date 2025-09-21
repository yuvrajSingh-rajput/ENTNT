// api/candidates.js
import { DatabaseService } from '../src/lib/db';

export default async function handler(req, res) {
  const { method, query, body, url } = req;
  const params = new URLSearchParams(query);

  if (method === 'GET') {
    const search = params.get('search') || '';
    const stage = params.get('stage') || '';
    const page = parseInt(params.get('page') || '1');
    const pageSize = parseInt(params.get('pageSize') || '50');
    const data = await DatabaseService.getCandidates({ search, stage, page, pageSize });
    return res.status(200).json(data);
  }

  if (method === 'POST') {
    const candidateData = body;
    const newCandidate = await DatabaseService.createCandidate(candidateData);
    return res.status(201).json(newCandidate);
  }

  if (method === 'PATCH') {
    const id = url.split('/').pop(); // Extract id from /api/candidates/:id
    const updates = body;
    const updatedCandidate = await DatabaseService.updateCandidate(id, updates);
    if (!updatedCandidate) return res.status(404).json({ error: 'Candidate not found' });
    return res.status(200).json(updatedCandidate);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}