import { createRouter } from '@/lib/create-app';
import { env } from '@/lib/env';

const router = createRouter().post('/*', async (c) => {
  const options = {
    method: c.req.method,
    headers: c.req.raw.headers,
    body: c.req.raw.body,
    duplex: 'half',
  };

  try {
    const res = await fetch(`${env.GUACAMOLE_SERVER_URL}/api/tokens`, options); // <==
    console.log('Guacamole response', res);

    const newResponse = new Response(res.body, res);
    return newResponse;
  } catch (err) {
    console.log('Guacamole server proxy error', err);
    return new Response('Internal server error', { status: 500 });
  }
});

export default router;
