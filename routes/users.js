import express from 'express';
import path from 'path';
import pool from '../config/db.js';
import { isBefore, parseISO } from 'date-fns';
import { fileURLToPath } from 'url';
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/getUserData', (req, res) => {
  res.json(req.user);
});


export default router;
