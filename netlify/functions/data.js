const { getStore } = require('@netlify/blobs');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function getBlobStore() {
  const siteID = process.env.BLOBS_SITE_ID;
  const token = process.env.BLOBS_TOKEN;
  if (siteID && token) {
    return getStore({ name: 'lcgi-dashboard', siteID, token });
  }
  return getStore('lcgi-dashboard');
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  const store = getBlobStore();

  if (event.httpMethod === 'GET') {
    const key = event.queryStringParameters && event.queryStringParameters.key;
    if (!key) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'missing key' }) };
    }
    const value = await store.get(key);
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: value || null })
    };
  }

  if (event.httpMethod === 'POST') {
    let payload;
    try { payload = JSON.parse(event.body || '{}'); } catch (e) { payload = {}; }
    const { key, value } = payload;
    if (!key) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'missing key' }) };
    }
    await store.set(key, value);
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true })
    };
  }

  return { statusCode: 405, headers: CORS, body: 'Method not allowed' };
};
