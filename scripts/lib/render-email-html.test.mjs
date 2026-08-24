import { describe, it, expect } from 'vitest';
import { renderEmailHtml } from './render-email-html.mjs';

describe('renderEmailHtml', () => {
  it('inclut le sujet dans la balise title', () => {
    const html = renderEmailHtml({ subject: 'Sujet de test', bodyText: 'Bonjour.' });
    expect(html).toContain('<title>Sujet de test</title>');
  });

  it('met chaque paragraphe (séparé par une ligne vide) dans son propre <p>', () => {
    const html = renderEmailHtml({ subject: 'S', bodyText: 'Premier paragraphe.\n\nSecond paragraphe.' });
    expect((html.match(/<p /g) || []).length).toBeGreaterThanOrEqual(2);
    expect(html).toContain('Premier paragraphe.');
    expect(html).toContain('Second paragraphe.');
  });

  it("n'affiche la mention de désinscription que pour la variante cold-outbound", () => {
    const cold = renderEmailHtml({ subject: 'S', bodyText: 'B.', variant: 'cold-outbound' });
    const postFacture = renderEmailHtml({ subject: 'S', bodyText: 'B.', variant: 'post-facture' });
    expect(cold).toContain('lien_desinscription');
    expect(postFacture).not.toContain('lien_desinscription');
  });

  it('échappe les caractères spéciaux HTML dans le sujet', () => {
    const html = renderEmailHtml({ subject: 'A & B < C', bodyText: 'B.' });
    expect(html).toContain('<title>A &amp; B &lt; C</title>');
  });
});
