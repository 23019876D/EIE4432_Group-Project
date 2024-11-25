import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import loginRoute from './login.js';
import matchRoute from './matches.js';
import seatsRouter from './seats.js';
import mongostore from 'connect-mongo';
import client from './dbclient.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: '23064267d_23019876d_eie4432_grouproject',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: 3600000 },
    store: mongostore.create({
      client,
      dbName: 'football',
      collectionName: 'session',
    }),
  })
);

app.use('/auth', loginRoute);
app.use('/matches', matchRoute);
app.use('/', seatsRouter);
app.use(express.static(path.join(__dirname, '../static')));

app.get('/', (req, res) => {
  if (req.session.logged) {
    res.redirect('/home.html');
  } else {
    res.redirect('/index.html');
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  const currentTime = new Date().toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' });
  console.log(`${currentTime}`);
  console.log(`Server started at http://127.0.0.1:${PORT}`);
});
