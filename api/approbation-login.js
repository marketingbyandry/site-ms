import { isValidToken, sessionCookie, tokenFromPassword } from '../lib/approbation.mjs';

// Reçoit le mot de passe saisi sur le formulaire d'accès à approbation.html
// (servi par middleware.js). Mot de passe correct : cookie de session posé,
// retour à la page. Incorrect : retour au formulaire avec ?erreur=1.
// Toujours une redirection 303 : le formulaire est un POST HTML classique.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';
  const token = await tokenFromPassword(password);

  if (!password || !(await isValidToken(token))) {
    res.setHeader('Location', '/approbation.html?erreur=1');
    res.status(303).end();
    return;
  }

  res.setHeader('Set-Cookie', sessionCookie(token));
  res.setHeader('Location', '/approbation.html');
  res.status(303).end();
}
