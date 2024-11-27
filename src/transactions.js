import express from 'express';
import { save_transaction, modify_transaction } from './transactiondb.js';
import { modify_seat } from './seatdb.js';
import client from './dbclient.js';
const transactions = client.db('football').collection('transaction');
const router = express.Router();

router.post('/transactions', async (req, res) => {
  const { matchid, seat, price, userid, cardname, cardnumber, cardexpdate, cardcvv } = req.body;
  console.log('Received Data:', req.body);
  if (!matchid || !seat || !price || !userid || !cardname || !cardnumber || !cardexpdate || !cardcvv) {
    return res.status(400).json({ status: 'failed', message: 'Missing required fields' });
  }

  try {
    const transaction = {
      userid,
      matchid,
      seat,
      price,
      cardname,
      cardnumber: `${cardnumber.slice(0, 4)}************`,
      cardcvv,
      cardexpdate,
      status: 'pending',
      transactiondate: new Date().toISOString(),
      ticketpass: 'assets/ticketpass.png',
    };

    const result = await save_transaction(transaction);
    if (result) {
      console.log('Transaction saved:', transaction); // Debug: Log saved transaction
      res.status(200).json({ status: 'success', message: 'Transaction saved successfully' });
    } else {
      console.error('Failed to save transaction'); // Debug: Log failure
      res.status(500).json({ status: 'failed', message: 'Failed to save transaction' });
    }
  } catch (error) {
    console.error('Error saving transaction:', error); // Debug: Log error
    res.status(500).json({ status: 'failed', message: 'Internal server error' });
  }
});

router.put('/confirm', async (req, res) => {
  const { matchid, seat, userid, status } = req.body;

  console.log('Request Body:', req.body); // Debugging

  if (!matchid || !seat || !userid || !status) {
    console.error('Missing required fields in request body');
    return res.status(400).json({ status: 'failed', message: 'Missing required fields' });
  }

  try {
    const transactionUpdateResult = await modify_transaction(matchid, seat, userid, { status });
    console.log('Transaction Update Result:', transactionUpdateResult); // Debugging

    if (!transactionUpdateResult || transactionUpdateResult.modifiedCount === 0) {
      console.error('Transaction update failed or no changes made');
      return res.status(500).json({ status: 'failed', message: 'Failed to update transaction' });
    }
    let allSeatsUpdated = true;

    if (status === 'success') {
      for (const seatId of seat) {
        console.log(`Attempting to update seat: ${seatId} for match ${matchid}`);
        const updateResult = await modify_seat(matchid, seatId, { isBooked: true, userId: userid });
        console.log(`Seat Update Result for ${seatId}:`, updateResult);

        if (!updateResult) {
          console.warn(`Failed to update seat: ${seatId}`);
          allSeatsUpdated = false;
        }
      }
    }

    if (allSeatsUpdated) {
      res.status(200).json({ status: 'success', message: 'Transaction and seats updated successfully' });
    } else {
      console.warn('Some seats were not updated successfully');
      res.status(500).json({ status: 'failed', message: 'Failed to update some seats' });
    }
  } catch (error) {
    console.error('Error updating transaction and seats:', error);
    res.status(500).json({ status: 'failed', message: 'Internal server error' });
  }
});

router.post('/result', async (req, res) => {
  const { userid, matchid, seat, status } = req.body;

  console.log('Received Query for Transaction:', req.body);

  if (!userid || !matchid || !seat || !Array.isArray(seat)) {
    return res.status(400).json({ status: 'failed', message: 'Missing or invalid required fields' });
  }

  try {
    // Search for the transaction in the database
    const transaction = await transactions.findOne({
      userid,
      matchid,
      seat: { $all: seat },
      status, // Ensure all seats in the array match
    });

    if (transaction) {
      console.log('Transaction Found:', transaction);
      res.status(200).json({ status: 'success', transaction });
    } else {
      console.warn('Transaction not found');
      res.status(404).json({ status: 'failed', message: 'Transaction not found' });
    }
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ status: 'failed', message: 'Internal server error' });
  }
});

export default router;
