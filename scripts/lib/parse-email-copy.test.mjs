import { describe, it, expect } from 'vitest';
import { parseEmailCopy } from './parse-email-copy.mjs';

const FIXTURE = `### 1. Test email

**Objet :** Sujet de test

Bonjour {{prenom}},

Ceci est un paragraphe.

---

### 2. Deuxième email

**Objet :** Autre sujet

Corps du deuxième email.

---
`;

describe('parseEmailCopy', () => {
  it('extrait id, titre, sujet et corps pour chaque bloc', () => {
    const result = parseEmailCopy(FIXTURE);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 1,
      title: 'Test email',
      subject: 'Sujet de test',
      bodyText: 'Bonjour {{prenom}},\n\nCeci est un paragraphe.',
    });
    expect(result[1].id).toBe(2);
    expect(result[1].subject).toBe('Autre sujet');
    expect(result[1].bodyText).toBe('Corps du deuxième email.');
  });
});
