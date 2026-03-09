// netlify/functions/beehiiv-subscribe.js
// ─────────────────────────────────────────────────────────────
// Secure server-side proxy for Beehiiv API.
// Keeps your API key off the client (browser never sees it).
// Netlify runs this as a serverless function automatically.
// ─────────────────────────────────────────────────────────────

exports.handler = async function(event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let email;
  try {
    const body = JSON.parse(event.body);
    email = body.email;
  } catch (e) {
    return { statusCode: 400, body: 'Invalid request body' };
  }

  if (!email || !email.includes('@')) {
    return { statusCode: 400, body: 'Invalid email' };
  }

  const BEEHIIV_API_KEY = 'HryIQ9mFjJjnKqgLwfwOAkj1ljplqRHNmjD1xIwMaGjU7sSmAi7oIRrKRr011Nbo';
  const PUBLICATION_ID  = 'pub_7379cea0-ab88-49bc-9bee-19ab9303ce4e';

  try {
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${PUBLICATION_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BEEHIIV_API_KEY}`
        },
        body: JSON.stringify({
          email: email,
          reactivate_existing: false,
          send_welcome_email: true,
          utm_source: 'serevacare.com',
          utm_medium: 'website',
          utm_campaign: 'waitlist'
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Beehiiv error:', data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Beehiiv subscription failed', detail: data })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, subscriber: data?.data?.id || null })
    };

  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
