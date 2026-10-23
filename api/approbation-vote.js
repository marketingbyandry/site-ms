import {
  POSTHOG_CAPTURE_URL,
  buildReviewEvent,
  isValidToken,
  readCookie,
  validateVote
} from '../lib/approbation.mjs';

// Enregistre la décision de l'équipe com sur un post (approuvé / à modifier /
// refusé) sous forme d'événement PostHog `post_review`. La routine
// hebdomadaire relit ces événements pour savoir quels posts publier.
//
// Le cookie de session est revérifié ici : le middleware ne protège que la
// page, pas cet endpoint.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  if (!(await isValidToken(readCookie(req.headers.cookie)))) {
    res.status(401).json({ error: 'session expirée, rechargez la page' });
    return;
  }

  const validation = validateVote(req.body);
  if (!validation.ok) {
    res.status(validation.status).json({ error: validation.error });
    return;
  }

  const apiKey = process.env.POSTHOG_PROJECT_KEY;
  if (!apiKey) {
    console.error('POSTHOG_PROJECT_KEY absente : vote non enregistré');
    res.status(503).json({ error: 'enregistrement indisponible' });
    return;
  }

  try {
    const response = await fetch(POSTHOG_CAPTURE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildReviewEvent({
        apiKey,
        ...validation.value,
        timestamp: new Date().toISOString()
      }))
    });
    if (!response.ok) {
      console.error('PostHog a refusé le vote', response.status, await response.text());
      res.status(502).json({ error: 'enregistrement refusé' });
      return;
    }
  } catch (err) {
    console.error('PostHog injoignable', err);
    res.status(502).json({ error: 'enregistrement indisponible' });
    return;
  }

  res.status(204).end();
}
