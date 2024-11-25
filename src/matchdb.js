import fs from 'fs/promises';
import path from 'path';
import client from './dbclient.js';

const currentTime = new Date().toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' });
console.log(`connecting to matchdb on${currentTime}`);

const matches = client.db('football').collection('match');

async function init_db() {
  try {
    const count = await matches.countDocuments();
    if (count === 0) {
      const data = await fs.readFile('match.json', 'utf-8');
      const matchArray = JSON.parse(data);
      for (let match of matchArray) {
        if (match.imagePath) {
          try {
            const imageBuffer = await fs.readFile(path.resolve(match.imagePath));
            match.image = imageBuffer;
            delete match.imagePath;
          } catch (err) {
            console.error(`Failed to read image for user ${match.username}:`, err);
          }
        }
      }
      const result = await matches.insertMany(matchArray);
      console.log(`Added ${result.insertedCount} matches`);
    }
  } catch (err) {
    console.error('Unable to initialize the database!', err);
  }
}
init_db().catch(console.dir);

async function create_match(matchId, matchName, status, date, venue, description, matchimage) {
  try {
    const result = await matches.updateOne(
      { matchId },
      {
        $set: {
          matchId,
          matchName,
          status,
          date: new Date(date),
          venue,
          description,
          matchimage,
        },
      },
      { upsert: true }
    );
    return true;
  } catch (error) {
    console.error('Unable to update the match database!', error);
    return false;
  }
}

async function fetch_all_matches() {
  try {
    const allMatches = await matches.find().toArray();
    return allMatches;
  } catch (error) {
    console.error('Unable to fetch matches from database!', error);
    throw error;
  }
}

async function fetch_match(matchId) {
  try {
    const match = await matches.findOne({ matchId });
    console.log('Fetched match:', match);
    if (match) {
      return match;
    }
    return null;
  } catch (error) {
    console.error('Unable to fetch match from database!', error);
    return false;
  }
}

async function matchId_exist(matchId) {
  try {
    const match = await fetch_match(matchId);
    console.log(`Does match ID "${matchId}" exist?`, match !== null);
    return match !== null;
  } catch (error) {
    console.error('Unable to fetch match from database!', error);
    return false;
  }
}

async function modify_match(matchId, updates) {
  try {
    const currentMatch = await fetch_match(matchId);

    if (!currentMatch) {
      const newMatch = {
        matchId: matchId,
        matchName: updates.matchName || 'Unknown Match',
        status: updates.status || 'Upcoming',
        date: updates.date || 'TBD',
        venue: updates.venue || 'Unknown Venue',
        description: updates.description || 'No description provided.',
        matchimage: updates.matchimage || null,
      };
      const result = await matches.insertOne(newMatch);
      console.log('New match created:', result.insertedId);
      return true;
    }

    const newUpdates = {};
    newUpdates.matchName = updates.matchName || currentMatch.matchName;
    newUpdates.status = updates.status || currentMatch.status;
    newUpdates.date = updates.date || currentMatch.date;
    newUpdates.venue = updates.venue || currentMatch.venue;
    newUpdates.description = updates.description || currentMatch.description;
    newUpdates.matchimage = updates.matchimage || currentMatch.matchimage;

    if (
      JSON.stringify(newUpdates) ===
      JSON.stringify({
        matchName: currentMatch.matchName,
        status: currentMatch.status,
        date: currentMatch.date,
        venue: currentMatch.venue,
        description: currentMatch.description,
        matchimage: currentMatch.matchimage,
      })
    ) {
      console.log('No updates to apply');
      return true;
    }

    const result = await matches.updateOne(
      { matchId: matchId },
      {
        $set: newUpdates,
      },
      { upsert: true }
    );

    console.log('Match updated in database:', result); // Debugging

    if (result.modifiedCount > 0) {
      console.log('Updated existing match');
      return true;
    } else {
      console.log('No changes were made');
      return true;
    }
  } catch (error) {
    console.error('Unable to modify the match data!', error);
    return false;
  }
}

async function create_match_with_seats(matchId, matchName, status, date, venue, description, matchimage, price) {
  try {
    const matchCreated = await create_match(matchId, matchName, status, date, venue, description, matchimage);
    if (!matchCreated) {
      return false;
    }

    const seats = [];
    for (let i = 1; i <= 60; i++) {
      seats.push({
        matchId,
        seat: `S${i}`,
        isBooked: false,
        price,
      });
    }

    const seatCollection = client.db('football').collection('seat');
    const result = await seatCollection.insertMany(seats);
    console.log(`Added ${result.insertedCount} seats for match ${matchId}`);
    return true;
  } catch (error) {
    console.error('Error creating match with seats:', error);
    return false;
  }
}

export { create_match, fetch_all_matches, fetch_match, matchId_exist, modify_match, create_match_with_seats };
