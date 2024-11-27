import express from 'express';
import { MongoClient } from 'mongodb';

const router = express.Router();

const client = new MongoClient('mongodb://localhost:27017');
const dbName = 'football';
let sessionCollection;

async function initializeDb() {
  try {
    await client.connect();
    console.log('Successfully connected to the database!');
    const db = client.db(dbName);
    sessionCollection = db.collection('session');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  }
}
initializeDb();

router.get('/currentMatch', async (req, res) => {
  try {
    const sessionInfo = await sessionCollection.findOne({ userId: req.session.userid });
    if (!sessionInfo || !sessionInfo.currentMatchId) {
      return res.status(400).json({ error: 'No match selected.' });
    }

    res.json({ matchId: sessionInfo.currentMatchId });
  } catch (error) {
    console.error('Error fetching current match:', error);
    res.status(500).json({ error: 'Unable to fetch current match.' });
  }
});

export default router;
