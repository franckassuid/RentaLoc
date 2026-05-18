// ─── Defaults ────────────────────────────────────────────────────────────────
export const DEFAULTS = {
  nom: 'Bien A',
  ville: '',
  prixFAI: 87000,
  tauxNotaire: 8,
  budgetMobilier: 3000,
  loyerMensuel: 530,
  vacanceMois: 1,
  chargesCopro: 600,
  taxeFonciere: 900,
  cfe: 250,
  assurancePNO: 150,
  fraisGestion: 7,
  provisionTravaux: 300,
  fraisComptable: 400,
  apport: 15000,
  dureeEmprunt: 20,
  tauxInteret: 3.5,
  tauxAssurance: 0.3,
};

// ─── Thresholds ───────────────────────────────────────────────────────────────
export const THRESHOLDS = {
  rendementBrut: { green: 8, yellow: 7 },   // ≥8 vert, 7-8 jaune, <7 rouge
  cashflow: { green: 0, yellow: -100 },       // >0 vert, -100-0 jaune, <-100 rouge
  budgetTotal: { green: 100000 },             // ≤100k vert, >100k rouge
};

// ─── Tooltips ─────────────────────────────────────────────────────────────────
// Champs SANS tooltip (pas d'icône ⓘ) : nom, ville, dureeEmprunt
export const TOOLTIPS = {
  // 🏠 Le bien
  prixFAI: "Prix frais d'agence inclus — c'est le prix de l'annonce. Le prix net vendeur est plus bas mais c'est le FAI qui compte pour votre calcul de rendement.",
  tauxNotaire: "7–8 % dans l'ancien (standard), 2–3 % dans le neuf. En cas de doute, utiliser 8 % — mieux vaut surestimer.",
  budgetMobilier: "Obligatoire pour le statut LMNP : le logement doit être meublé. Intègre ici le mobilier + les éventuels petits travaux de rafraîchissement (peinture, sols).",

  // 💶 Revenus
  loyerMensuel: "Vérifier sur LeBonCoin et SeLoger — filtrer par surface et meublé dans le même quartier.",
  vacanceMois: "Nombre de mois sans locataire que vous provisionnez par an. 1 mois = 8,3 % de perte. En dessous de 1 mois, vous prenez un risque — ne pas descendre sauf demande locative très solide documentée.",

  // 💸 Charges
  chargesCopro: "Saisir uniquement la part non récupérable sur le locataire (eau froide des parties communes, entretien ascenseur, gardien…). La part récupérable ne pèse pas sur votre rendement.",
  taxeFonciere: "Demander l'avis d'imposition n−1 du vendeur — c'est le seul chiffre fiable. Les simulateurs en ligne sont imprécis car la base cadastrale varie bien par bien, même dans le même immeuble.",
  cfe: "Cotisation Foncière des Entreprises — due par tout loueur en meublé (LMNP ou LMP). Montant variable selon la commune et votre chiffre d'affaires, généralement 200–400 €/an. Demander à votre comptable après la première déclaration.",
  assurancePNO: "Assurance Propriétaire Non Occupant — obligatoire en copropriété depuis la loi Alur. Couvre les dommages causés au tiers si le logement est vacant ou si le locataire est sous-assuré. Compter 100–200 €/an.",
  fraisGestion: "Pourcentage du loyer perçu (hors charges) facturé par l'agence de gestion. Entre 6 et 10 % selon les agences locales. Vérifier si les états des lieux sont inclus.",
  provisionTravaux: "Coussin annuel pour absorber les petites réparations et imprévus. Minimum 300 €/an. Règle prudente : 1 % de la valeur du bien par an.",
  fraisComptable: "En LMNP au réel, un expert-comptable est quasi-indispensable. Entre 300 et 600 €/an selon le cabinet. Prévoir 400 € par défaut.",

  // 🏦 Financement — dureeEmprunt sans tooltip
  apport: "Capital personnel que vous injectez dans cette opération. Attention : les banques préfèrent que les frais de notaire soient couverts par l'apport — inclure au minimum 7–8 % du prix FAI dans ce montant.",
  tauxInteret: "Taux moyen sur 20 ans en mai 2026 : environ 3,80 %. À ajuster selon votre offre bancaire. Ne pas confondre avec le TAEG.",
  tauxAssurance: "Taux annuel sur le capital initial emprunté. Vous pouvez déléguer cette assurance hors de votre banque (loi Lemoine) — souvent 2 à 3 fois moins cher. Taux de référence : 0,20–0,35 % pour un profil standard 30–40 ans.",
};
