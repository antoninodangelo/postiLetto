import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import passport from 'passport';
import { Strategy as LocalStrategy } from "passport-local";
import { pool } from './config/db.js';

import bcrypt from "bcryptjs";
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import territorioRouter from './routes/territorio.js'
import session from 'express-session';
import validator from 'validator';
const app = express();

// Ricrea __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: 'monito alle future generazioni',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new LocalStrategy(
    {
      usernameField: "mail",     // <── IMPORTANTE
      passwordField: "password"  // opzionale ma consigliato
    },
    async (mail, password, done) => {
      const sql = 'SELECT * FROM utenti WHERE mail = ?';

      try {
        // 1. Validazione formato Email
        if (!validator.isEmail(mail)) {
          return done(null, false, { message: 'Incorrect mail' });
        }

        // 2. Esegui la query (basta il try principale per catturare gli errori del DB)
        const [rows] = await pool.execute(sql, [mail]);
        const user = rows[0];

        // 3. Controlla se l'utente esiste davvero nel database
        if (!user) {
          return done(null, false, { message: 'Incorrect mail.' });
        }

        // 4. SOLO ORA puoi leggere user.password e confrontarla
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        // 5. Se tutto è corretto, invii l'utente a Passport

        return done(null, user);
        // 6. qunando l'utente è autenticato, Passport lo memorizza nella sessione chiamando la funzione
        // req.login(user) che richiama serializeUser 
        /*  La LocalStrategy restituisce l’oggetto utente → done(null, user)
            Passport chiama automaticamente → req.login(user)
            req.login() chiama → serializeUser(user)     
            serializeUser restituisce l’ID → done(null, user.IDUtente) 
        */
      } catch (err) {
        // Cattura sia gli errori del DB (pool.execute) sia altri errori imprevisti
        return done(err);
      }
    }

  )
);
passport.serializeUser((user, done) => {
  done(null, user.IDUtente);
});

passport.deserializeUser(async (id, done) => {
  const sql = `SELECT utenti.IDUtente, IDPubblico, IDUtentiFigura, mail, nome, cognome, utenti.telefono, utenti.telefono1, utenti.attivo, z.IDZona
    FROM utenti
    INNER JOIN utenti_setting us ON us.IDUtente = utenti.IDUtente
    INNER JOIN setting s ON s.IDSetting = us.IDSetting
    INNER JOIN zone z ON z.IDZona = s.IDZona
    WHERE utenti.IDUtente = ? AND utenti.attivo = 1`;
  try {
    const [rows] = await pool.execute(sql, [id]);
    const user = rows[0];
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
// ROUTES
app.post("/log_in",
  passport.authenticate("local", {
    successRedirect: "/setting",
    failureRedirect: "/login?error=1"
  })
);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/territorio', territorioRouter);



// Catch 404
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
// Error handler
app.use((err, req, res, next) => {
  // Aggiungi 'title' per evitare il ReferenceError in layout.jade
  res.locals.title = 'Errore';
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');

});



export default app;
