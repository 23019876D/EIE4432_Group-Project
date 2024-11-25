import express from 'express';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { create_match, fetch_all_matches, fetch_match, matchId_exist, modify_match } from './matchdb.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/events', async (req, res) => {
  try {
    const matches = await fetch_all_matches();
    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch match data' });
  }
});

router.get('/event/:matchId', async (req, res) => {
  try {
    const match = await fetch_match(req.params.matchId);
    if (match) {
      res.json(match);
    } else {
      res.status(404).json({ error: 'Match not found' });
    }
  } catch (error) {
    console.error('Error fetching match by ID:', error);
    res.status(500).json({ error: 'Failed to fetch match data' });
  }
});

router.post('/event', upload.single('matchpic'), async (req, res) => {
  const { matchId, matchName, venue, startTime, status, description } = req.body;

  let matchImagePath = null;
  if (req.file) {
    try {
      const ext = path.extname(req.file.originalname);
      const newFileName = `match_${matchId}${ext}`;
      const newPath = path.join(__dirname, '../static/match/', newFileName);

      console.log('Original file path:', req.file.path);
      console.log('New file path:', newPath);
      await fs.rename(req.file.path, newPath);
      matchImagePath = `match/${newFileName}`;
    } catch (fileError) {
      console.error('Error handling match image upload:', fileError);
      return res.status(500).json({
        status: 'failed',
        message: 'Error processing match image',
      });
    }
  }

  let parsedDate;
  try {
    parsedDate = new Date(startTime);
    if (isNaN(parsedDate)) throw new Error('Invalid date');
    console.log('Parsed Date:', parsedDate);
  } catch (error) {
    console.error('Error parsing date:', error);
    return res.status(400).json({ error: 'Invalid date format' });
  }

  try {
    const success = await modify_match(matchId, {
      matchName: matchName,
      status: status,
      date: parsedDate,
      venue: venue,
      description: description,
      matchimage: matchImagePath,
    });
    if (success) {
      return res.status(200).json({
        status: 'success',
        message: 'Match details updated or created successfully',
      });
    } else {
      res.status(500).json({
        status: 'failed',
        message: 'Could not update the profile',
      });
    }
  } catch (error) {
    console.error('Error in POST /event:', error);
    res.status(500).json({
      status: 'failed',
      message: 'Internal server error',
    });
  }
});

export default router;

// router.post('/event', upload.single('matchpic'), async (req, res) => {
//   const { matchId, matchName, venue, date, prices } = req.body;
//   try {
//     const matchExists = await matchId_exist(matchId);
//     if (matchExists) {
//       const updated = await modify_match(matchId, { matchName, venue, date, prices });
//       if (updated) return res.status(200).json({ success: true });
//     } else {
//       const created = await create_match(matchId, matchName, 'upcoming', date, venue, prices);
//       if (created) return res.status(201).json({ success: true });
//     }
//     res.status(500).json({ error: 'Failed to save match details.' });
//   } catch (error) {
//     console.error('Error in POST /event:', error);
//     res.status(500).json({ error: 'Failed to save match details.' });
//   }
// });
