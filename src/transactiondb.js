import fs from 'fs/promises';
import client from './dbclient.js';

const currentTime = new Date().toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' });
console.log(`Connecting to transaction collection on ${currentTime}`);

const transactions = client.db('football').collection('transaction');

async function init_db() {
  try {
    const count = await transactions.countDocuments();
    if (count === 0) {
      const data = await fs.readFile('transaction.json', 'utf-8');
      const transactionArray = JSON.parse(data);
      const result = await transactions.insertMany(transactionArray);
      console.log(`Added ${result.insertedCount} transactions`);
    } else {
      console.log('Transaction database already initialized.');
    }
  } catch (err) {
    console.error('Unable to initialize the transaction database!', err);
  }
}

async function create_transaction(matchid, userid, seat, cardnumber, cardexpdate, cardname, cardcsv, price) {
  try {
    const result = await transactions.updateOne(
      { matchid, seat },
      {
        $set: {
          matchid,
          userid,
          seat,
          cardnumber,
          cardexpdate,
          cardname,
          cardcsv,
          price,
          transactiondate: new Date(),
          status: 'success',
        },
      },
      { upsert: true }
    );
    if (result.upsertedCount > 0) {
      console.log('Added 1 transaction');
    } else {
      console.log('Updated existing transaction');
    }
    return true;
  } catch (error) {
    console.error('Unable to update the transaction database!', error);
    return false;
  }
}

async function fetch_all_transaction() {
  try {
    const allTransactions = await transactions.find().toArray();
    return allTransactions;
  } catch (error) {
    console.error('Unable to fetch transactions from database!', error);
    throw error;
  }
}

async function fetch_transaction(matchId, seat) {
  try {
    const transactionData = await transactions.findOne({ matchId, seat });
    if (transactionData) {
      return transactionData;
    }
    return null;
  } catch (error) {
    console.error('Unable to fetch transaction from database!', error);
    return false;
  }
}

async function fetch_user_transactions(userid) {
  try {
    const transaction = await transactions.find({ userid }).toArray();
    if (transaction) {
      return transaction;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return false;
  }
}

async function save_transaction(transaction) {
  try {
    const result = await transactions.insertOne(transaction);
    return result.insertedId ? true : false;
  } catch (error) {
    console.error('Error saving transaction:', error);
    return false;
  }
}

async function modify_transaction(matchid, seat, userid, updates) {
  console.log(
    `Updating transaction: matchId=${matchid}, seat=${seat}, userId=${userid}, updates=${JSON.stringify(updates)}`
  );
  try {
    const result = await transactions.updateOne({ matchid, seat, userid }, { $set: updates });
    console.log('Transaction Update Result:', result);
    return result;
  } catch (error) {
    console.error('Error modifying transaction:', error);
    return false;
  }
}

init_db().catch(console.dir);

export {
  create_transaction,
  fetch_all_transaction,
  fetch_transaction,
  modify_transaction,
  fetch_user_transactions,
  save_transaction,
};
