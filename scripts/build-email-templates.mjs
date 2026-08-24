import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseEmailCopy } from './lib/parse-email-copy.mjs';
import { renderEmailHtml } from './lib/render-email-html.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const COPY_PATH = path.join(ROOT, 'docs/content/2026-07-campagne-communication-emails.md');
const OUT_DIR = path.join(ROOT, 'emails');

const POST_FACTURE_SLUGS = [
  'accuse-reception', 'resultat-analyse', 'relance-j3',
  'confirmation-signature', 'bienvenue-activation', 'demande-avis-parrainage',
];
const COLD_OUTBOUND_SLUGS = ['premier-contact', 'relance', 'breakup'];

function main() {
  const markdown = readFileSync(COPY_PATH, 'utf8');
  const emails = parseEmailCopy(markdown).filter((e) => e.id !== null);
  mkdirSync(OUT_DIR, { recursive: true });

  emails.forEach((email) => {
    const isColdOutbound = email.id >= 7;
    const slugList = isColdOutbound ? COLD_OUTBOUND_SLUGS : POST_FACTURE_SLUGS;
    const slugIndex = isColdOutbound ? email.id - 7 : email.id - 1;
    const slug = slugList[slugIndex];
    const prefix = isColdOutbound ? 'cold-outbound' : 'post-facture';
    const num = String(isColdOutbound ? email.id - 6 : email.id).padStart(2, '0');
    const filename = `${prefix}-${num}-${slug}.html`;

    const html = renderEmailHtml({
      subject: email.subject,
      bodyText: email.bodyText,
      variant: isColdOutbound ? 'cold-outbound' : 'post-facture',
    });

    writeFileSync(path.join(OUT_DIR, filename), html, 'utf8');
    console.log('Écrit :', filename);
  });

  console.log(`${emails.length} templates générés dans ${OUT_DIR}`);
}

main();
