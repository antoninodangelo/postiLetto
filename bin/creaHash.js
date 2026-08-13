import bcrypt from "bcrypt";

// Funzione che crea l'hash della password
async function creaPw(passwd) {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(passwd, saltRounds);
    console.log(hash);
    return hash;
  } catch (err) {
    console.error("Errore durante l'hashing:", err);
    throw err;
  }
}

// Legge la password dalla riga di comando
const password = process.argv[2];

if (!password) {
  console.error("Errore: devi fornire una password come argomento!");
  process.exit(1);
}

// Genera l'hash
try {
  const hash = await creaPw(password);
  console.log(`Hash generato: ${hash}`);
} catch (err) {
  console.error(`Errore durante la generazione dell'hash: ${err}`);
}
