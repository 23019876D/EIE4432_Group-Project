import fs from 'fs/promises';
import client from './dbclient.js';

const currentTime = new Date().toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' });
console.log(`Connecting to seatdb on ${currentTime}`);

const seats = client.db('football').collection('seat');

async function init_db() {
  try {
    const count = await seats.countDocuments();
    if (count === 0) {
      const data = await fs.readFile('seat.json', 'utf-8');
      const seatArray = JSON.parse(data);
      const result = await seats.insertMany(seatArray);
      console.log(`Added ${result.insertedCount} seats`);
    }
  } catch (err) {
    console.error('Unable to initialize the database!', err);
  }
}
init_db().catch(console.dir);

async function create_seat(matchId, section, row, seat, isBooked, ticketbuyer, price) {
  try {
    const result = await seats.updateOne(
      { matchId, seat },
      {
        $set: { matchId, section, row, seat, isBooked, ticketbuyer, price },
      },
      { upsert: true }
    );
    if (result.upsertedCount > 0) {
      console.log('Added 1 seat');
    } else {
      console.log('Updated existing seat');
    }
    return true;
  } catch (error) {
    console.error('Unable to update the seat database!', error);
    return false;
  }
}

async function fetch_all_seats() {
  try {
    const allSeats = await seats.find().toArray();
    return allSeats;
  } catch (error) {
    console.error('Unable to fetch seats from database!', error);
    throw error;
  }
}

async function fetch_seat(matchId, seat) {
  try {
    const seatData = await seats.findOne({ matchId, seat });
    if (seatData) {
      return seatData;
    }
    return null;
  } catch (error) {
    console.error('Unable to fetch seat from database!', error);
    return false;
  }
}

async function modify_seat(matchId, seat, updates) {
  console.log(`Modifying seat: matchId=${matchId}, seat=${seat}, updates=${JSON.stringify(updates)}`);
  try {
    const result = await seats.updateOne({ matchId, seat }, { $set: updates }, { upsert: false });
    console.log('Modify Seat Result:', result);
    if (result.modifiedCount > 0) {
      console.log('Updated seat successfully');
      return true;
    } else {
      console.log('No changes made to the seat');
      return false;
    }
  } catch (error) {
    console.error('Unable to modify the seat data!', error);
    return false;
  }
}

async function update_seat_price(matchId, seat, newPrice) {
  try {
    const result = await seats.updateOne({ matchId, seat }, { $set: { price: newPrice } }, { upsert: false });
    if (result.modifiedCount > 0) {
      console.log('Updated seat price successfully');
      return true;
    } else {
      console.log('No changes made to the seat price');
      return false;
    }
  } catch (error) {
    console.error('Unable to update the seat price!', error);
    return false;
  }
}

export { create_seat, fetch_all_seats, fetch_seat, modify_seat, update_seat_price, init_db };
