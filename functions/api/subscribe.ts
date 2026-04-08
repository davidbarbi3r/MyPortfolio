interface Env {
  BREVO_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://www.davidbarbier.com',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { email } = await context.request.json() as { email: string };

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Email invalide' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': context.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        listIds: [2],
        updateEnabled: true,
        attributes: {
          SOURCE: 'checklist-seo-ec',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      // Contact already exists is fine
      if (response.status === 400 && error.includes('already exist')) {
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      return new Response(JSON.stringify({ error: 'Erreur Brevo' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': 'https://www.davidbarbier.com',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
