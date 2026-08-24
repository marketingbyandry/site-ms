const BRAND = {
  dark: '#07131a',
  dark2: '#0a1f28',
  cream: '#f5f0e8',
  teal: '#1a7a8a',
  tealDark: '#0d4f5c',
  green: '#4cde80',
  muted: '#8aacb4',
};

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function renderEmailHtml({ subject, bodyText, variant = 'post-facture' }) {
  const paragraphs = bodyText
    .split(/\n\n+/)
    .map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${BRAND.cream};">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('\n');

  const footer = variant === 'cold-outbound'
    ? `<p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:${BRAND.muted};">Vous recevez cet email dans le cadre d'une démarche de prospection B2B fondée sur l'intérêt légitime, en lien avec votre fonction professionnelle. Pour ne plus recevoir nos messages, répondez "STOP" à cet email ou cliquez ici : {{lien_desinscription}}.</p>`
    : `<p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:${BRAND.muted};">M&amp;S Strategy — 09 52 92 64 98 — msstrategy@yahoo.com</p>`;

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.dark};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.dark};padding:32px 0;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:${BRAND.dark2};border-radius:8px;overflow:hidden;border:1px solid rgba(26,122,138,.25);">
<tr><td style="background:${BRAND.tealDark};padding:20px 32px;">
<span style="font-family:Arial,sans-serif;font-weight:800;font-size:16px;color:${BRAND.cream};">M&amp;S Strategy</span>
</td></tr>
<tr><td style="padding:32px;font-family:Arial,sans-serif;">
${paragraphs}
${footer}
</td></tr>
<tr><td style="background:${BRAND.teal};height:4px;"></td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
