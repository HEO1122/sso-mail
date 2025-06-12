import { connectToDatabase } from './database';

export default async function handler(req, res) {
  try {
    const connection = await connectToDatabase();
    const [rows] = await connection.execute('SELECT 1 + 1 AS solution');
    res.status(200).json({ solution: rows[0].solution });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}