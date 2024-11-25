import express from 'express';
import { db } from './dbclient.js';

const router = express.Router();
const transactions = db.collection('transactions');

router.post('/', async (req, res) => {
  try {
    const transactionData = req.body;

    if (!transactionData) {
      return res.status(400).json({ error: 'Invalid transaction data' });
    }

    const result = await transactions.insertOne(transactionData);
    res.status(201).json({ message: 'Transaction saved successfully', id: result.insertedId });
  } catch (error) {
    console.error('Error saving transaction:', error);
    res.status(500).json({ error: 'Failed to save transaction' });
  }
});

export default router;
