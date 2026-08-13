/* ════════════════════════════════════════
   ATTRIBUTION COMMERCIALE ET CAMPAGNE — lecture seule
   Expose window.msRef et window.msCamp pour que openTallyForm() transmette
   le commercial référent et le code de campagne dans les champs cachés du
   formulaire.

   Ce fichier n'écrit jamais les cookies : Safari plafonne à 7 jours tout
   cookie posé en JavaScript, ce qui perdrait les dossiers déposés plus de
   deux semaines après le mail du commercial. L'écriture se fait côté edge,
   dans middleware.js, où le Set-Cookie n'est pas plafonné.
   ════════════════════════════════════════ */
(function () {
  // Repli : un dossier déposé sans avoir suivi le lien d'un commercial
  // revient à Antoine. La colonne « ref » de Tally n'est donc jamais vide,
  // et aucune facture ne reste orpheline. Doit rester un slug listé dans
  // SLUGS (middleware.js).
  var DEFAULT_REF = 'ag';

  var refMatch = document.cookie.match(/(?:^|;\s*)ms_ref=([A-Za-z0-9_-]{1,32})/);
  window.msRef = refMatch ? refMatch[1] : DEFAULT_REF;

  // Code de campagne (segment + email) : optionnel, pas de repli — sert
  // uniquement à l'analyse de performance, jamais à l'attribution
  // commerciale ni à la commission.
  var campMatch = document.cookie.match(/(?:^|;\s*)ms_camp=([A-Za-z0-9_-]{1,32})/);
  window.msCamp = campMatch ? campMatch[1] : null;
})();
