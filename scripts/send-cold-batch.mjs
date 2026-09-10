#!/usr/bin/env node
// Envoie le lot du jour de mailing froid B2B via Brevo, a travers la CLI
// `composio` (le compte Brevo connecte porte la cle API — jamais lue ici).
//
// Usage : node scripts/send-cold-batch.mjs <batch.json> [alreadySentToday]
//
// batch.json : tableau de contacts deja domicilies, dedoublonnes et valides
// manuellement (voir docs/cold-mail-runbook.md) :
//   [{ "email": "...", "entreprise": "...", "type": "nominatif|generique",
//      "destinataire": "Jean Dupont", "segment": "chr|ind|tert|agri|log" }]
//
// Imprime sur stdout un resume JSON { sent, skippedBlocked, skippedCap,
// aborted, reason? } pour que l'operateur (ou l'agent qui a lance ce
// script) reporte le resultat dans le Google Sheet de suivi.

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import {
  buildColdEmailPayload,
  enforceDailyCap,
  isBounceRateSafe,
  filterBlockedContacts
} from '../lib/brevo-cold-outreach.mjs';

export const DAILY_CAP = 50;
export const BOUNCE_THRESHOLD_PCT = 5;
export const SEND_DELAY_MS = 3000;
export const SENDER_EMAIL = 'prospection@mail.cabinetms.fr';
export const SENDER_NAME = 'M&S Strategy';
export const SUBJECT = "Votre facture d'énergie, mise en concurrence gratuite";
export const TEMPLATE_PATH = new URL('../content/cold-mail-b2b/template.html', import.meta.url);

// Wrapper injectable autour de la CLI composio, pour rester testable sans
// reseau (voir test/send-cold-batch.test.mjs). Chaque appel renvoie le JSON
// parse de la sortie de la commande.
function defaultExecCli(args) {
  const output = execFileSync('composio', args, { encoding: 'utf8' });
  return JSON.parse(output);
}

// Pause synchrone bloquante — evite d'envoyer en rafale (garde-fou du
// design). Synchrone plutot qu'async pour rester simple a appeler dans une
// boucle for classique aux cotes de execFileSync, lui-meme synchrone.
function defaultSleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

// Recupere les emails bloques aujourd'hui (desinscrits/bounce/spam) via la
// liste de suppression Brevo, a travers le compte connecte Composio.
function fetchBlockedToday(execCli) {
  const today = new Date().toISOString().slice(0, 10);
  const result = execCli([
    'proxy',
    `https://api.brevo.com/v3/smtp/blockedContacts?startDate=${today}&endDate=${today}`,
    '--toolkit', 'brevo',
    '-X', 'GET'
  ]);
  return (result.contacts || []).map((c) => c.email);
}

function sendOne(execCli, payload) {
  return execCli([
    'proxy',
    'https://api.brevo.com/v3/smtp/email',
    '--toolkit', 'brevo',
    '-X', 'POST',
    '-d', JSON.stringify(payload)
  ]);
}

// Coeur testable : etant donne un lot deja valide, decide qui recoit un
// email et l'envoie. `execCli` est injecte pour les tests (pas d'appel
// reseau reel dans test/send-cold-batch.test.mjs).
export function runColdBatch({
  batch,
  template,
  alreadySentToday,
  execCli = defaultExecCli,
  cap = DAILY_CAP,
  thresholdPct = BOUNCE_THRESHOLD_PCT,
  delayMs = SEND_DELAY_MS,
  sleepFn = defaultSleep
}) {
  const blockedToday = fetchBlockedToday(execCli);

  if (!isBounceRateSafe(blockedToday.length, alreadySentToday, thresholdPct)) {
    return { sent: [], skippedBlocked: [], skippedCap: [], aborted: true, reason: 'bounce_rate' };
  }

  const { toSend, skipped: skippedBlocked } = filterBlockedContacts(batch, blockedToday);
  const capped = enforceDailyCap(toSend, alreadySentToday, cap);
  const skippedCap = toSend.slice(capped.length);

  const sent = [];
  for (let index = 0; index < capped.length; index++) {
    const contact = capped[index];
    try {
      const payload = buildColdEmailPayload(contact, {
        template,
        subject: SUBJECT,
        senderEmail: SENDER_EMAIL,
        senderName: SENDER_NAME
      });
      sendOne(execCli, payload);
      sent.push(contact.email);
      // Pas de delai apres le dernier envoi : rien a espacer derriere.
      if (index < capped.length - 1) {
        sleepFn(delayMs);
      }
    } catch (err) {
      // Stop attempting further sends if one fails (fail-safe).
      return {
        sent,
        skippedBlocked: skippedBlocked.map((c) => c.email),
        skippedCap: skippedCap.map((c) => c.email),
        aborted: true,
        reason: 'send_error',
        error: err.message,
        failedContact: contact.email
      };
    }
  }

  return {
    sent,
    skippedBlocked: skippedBlocked.map((c) => c.email),
    skippedCap: skippedCap.map((c) => c.email),
    aborted: false
  };
}

function main() {
  const batchPath = process.argv[2];
  if (!batchPath) {
    console.error('Usage: node scripts/send-cold-batch.mjs <batch.json> [alreadySentToday]');
    process.exit(1);
  }
  const alreadySentToday = Number(process.argv[3] || 0);
  const batch = JSON.parse(readFileSync(batchPath, 'utf8'));
  const template = readFileSync(TEMPLATE_PATH, 'utf8');

  const result = runColdBatch({ batch, template, alreadySentToday });
  console.log(JSON.stringify(result, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
