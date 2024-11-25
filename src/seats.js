import express from 'express';
import { fetch_all_seats, fetch_seat, modify_seat, update_seat_price } from './seatdb.js';

const router = express.Router();

router.get('/seats', async (req, res) => {
  try {
    const seats = await fetch_all_seats();
    res.json(seats);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch seats' });
  }
});

router.get('/seats/:matchId/:seat', async (req, res) => {
  const { matchId, seat } = req.params;
  try {
    const seatData = await fetch_seat(matchId, seat);
    if (seatData) {
      res.json(seatData);
    } else {
      res.status(404).json({ error: 'Seat not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch seat data' });
  }
});

router.put('/seats/:matchId/:seat', async (req, res) => {
  const { matchId, seat } = req.params;
  const updates = req.body;

  try {
    const result = await modify_seat(matchId, seat, updates);
    if (!result) {
      res.status(404).json({ error: 'Seat not found or no updates applied' });
    } else {
      res.json({ success: 'Seat updated successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Unable to modify seat data' });
  }
});

router.put('/seats/:matchId/:seat/price', async (req, res) => {
  const { matchId, seat } = req.params;
  const { newPrice } = req.body;

  if (!newPrice || isNaN(newPrice)) {
    return res.status(400).json({ error: 'Invalid price value' });
  }

  try {
    const result = await update_seat_price(matchId, seat, parseFloat(newPrice));
    if (!result) {
      res.status(404).json({ error: 'Seat not found or no price change made' });
    } else {
      res.json({ success: 'Seat price updated successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update seat price' });
  }
});

export default router;
