const SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwC8M6M-zupvyvYaiz6MyN5D9hvnVZKtU2a1Tsw2dT-k2bP0u3dx96P4LZ5Wk8drFgi/exec';

async function sendToSheets({ name, score, answer }) {
  try {
    // Важно: используем text/plain чтобы не было CORS preflight
    await fetch(SHEETS_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ name, score, answer })
    });
    return true;
  } catch (e) {
    console.error('Sheets send error', e);
    return false;
  }
}
