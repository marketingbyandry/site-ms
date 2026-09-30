// Fonctions pures : construction du payload Brevo et garde-fous de volume/
// conformite pour le mailing froid B2B. Aucun appel reseau ici — les appels
// reels passent par `composio proxy` (voir scripts/send-cold-batch.mjs), qui
// porte seul la connaissance de comment joindre Brevo.

const TOKEN_PATTERN = /\{\{(\w+)\}\}/g;

// Remplace les tokens {{CLE}} d'un template HTML par les valeurs de `data`.
// Un token sans valeur correspondante est laisse tel quel : mieux vaut un
// token visible dans un envoi de test qu'un champ vide non detecte.
export function fillTemplate(template, data) {
  return template.replace(TOKEN_PATTERN, (match, key) => (
    Object.prototype.hasOwnProperty.call(data, key) ? data[key] : match
  ));
}

const ENTITIES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", laquo: '«', raquo: '»', ndash: '–', mdash: '—', rsquo: '’', hellip: '…', euro: '€' };

// Version texte brut d'un email HTML, envoyee en `textContent` a cote du
// HTML : un email sans partie texte est un signal de spam classique. Le
// preheader masque et les commentaires conditionnels Outlook sont retires ;
// les liens gardent leur URL entre parentheses pour rester cliquables.
export function htmlToText(html) {
  return html
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<div[^>]*display:\s*none[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (match, href, label) => {
      const text = label.replace(/<[^>]+>/g, '').trim();
      const url = href.replace(/^(mailto|tel):/, '');
      // Un numero de telephone deja affiche en clair n'est pas repete.
      const sameNumber = href.startsWith('tel:') && text.replace(/\D/g, '').slice(-9) === url.replace(/\D/g, '').slice(-9);
      return text && !text.includes(url) && !sameNumber ? `${text} (${url})` : text || url;
    })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(div|p|tr|td|h\d|li|table)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#\d+|[a-z]+);/gi, (match, code) => (
      code[0] === '#' ? String.fromCodePoint(Number(code.slice(1))) : ENTITIES[code.toLowerCase()] ?? match
    ))
    .replace(/[ \t ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Construit le payload attendu par POST https://api.brevo.com/v3/smtp/email
// pour un contact du lot du jour. L'objet accepte les memes tokens que le
// template (ex. {{ENTREPRISE}}).
export function buildColdEmailPayload(contact, { template, subject, senderEmail, senderName }) {
  const prenom = contact.type === 'nominatif' && contact.destinataire
    ? contact.destinataire.split(' ')[0]
    : null;

  const data = {
    SALUTATION: prenom ? `Bonjour ${prenom},` : 'Bonjour,',
    ENTREPRISE: contact.entreprise,
    LIEN_FORMULAIRE: `https://cabinetms.fr/b2b.html?camp=mail-${contact.segment}`
  };
  const htmlContent = fillTemplate(template, data);

  return {
    sender: { email: senderEmail, name: senderName },
    to: [{ email: contact.email, name: contact.destinataire || contact.entreprise }],
    subject: fillTemplate(subject, data),
    htmlContent,
    textContent: htmlToText(htmlContent)
  };
}

// Tronque le lot du jour au plafond restant (cap - dejaEnvoyesAujourdhui).
// Ne renvoie jamais plus que ce qui peut encore etre envoye aujourd'hui.
export function enforceDailyCap(batch, alreadySentToday, cap) {
  const remaining = Math.max(0, cap - alreadySentToday);
  return batch.slice(0, remaining);
}

// true si le taux de blocage/bounce du jour reste sous le seuil (defaut 5%).
// sentToday = 0 est considere sur (rien envoye, rien a mesurer).
export function isBounceRateSafe(blockedToday, sentToday, thresholdPct = 5) {
  if (sentToday === 0) return true;
  return (blockedToday / sentToday) * 100 <= thresholdPct;
}

// Retire du lot les contacts deja presents dans la liste de suppression
// Brevo (desinscrits, hard bounce, plaintes spam), comparaison insensible a
// la casse.
export function filterBlockedContacts(batch, blockedEmails) {
  const blocked = new Set(blockedEmails.map((e) => e.toLowerCase()));
  const toSend = [];
  const skipped = [];
  for (const contact of batch) {
    if (blocked.has(contact.email.toLowerCase())) {
      skipped.push(contact);
    } else {
      toSend.push(contact);
    }
  }
  return { toSend, skipped };
}
