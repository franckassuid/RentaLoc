// Main PWA logic
import {
  computeGrossYield,
  computeNetYieldBeforeTax,
  computeMonthlyCashflowBeforeTax,
  computeAfterTaxMetrics
} from "./simulator.js";

const STORAGE_KEY_PROFILE = "rental-profile";

const defaultProfile = {
  rentalType: "meuble",          // "nu" | "meuble"
  taxRegime: "micro-bic",        // "micro-foncier" | "reel-foncier" | "micro-bic" | "reel-bic"
  tmi: 30,                       // %
  includeSocialTaxes: true,
  vacancyRate: 5                 // %
};

const STATUS_CLASSES = ["status-green", "status-orange", "status-red"];
const NET_TOOLTIP =
  "Renseignez votre profil pour calculer la rentabilité nette et nette-nette.";

/**
 * Load profile from localStorage.
 */
function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) return { profile: { ...defaultProfile }, isSaved: false };
    const parsed = JSON.parse(raw);
    return { profile: { ...defaultProfile, ...parsed }, isSaved: true };
  } catch (e) {
    console.error("Failed to load profile:", e);
    return { profile: { ...defaultProfile }, isSaved: false };
  }
}

/**
 * Save profile to localStorage.
 */
function saveProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile:", e);
  }
}

/**
 * Clear profile from localStorage.
 */
function clearProfile() {
  try {
    localStorage.removeItem(STORAGE_KEY_PROFILE);
  } catch (e) {
    console.error("Failed to clear profile:", e);
  }
}

/**
 * Parse numeric input, fallback to 0.
 */
function getNumberValue(inputId) {
  const el = document.getElementById(inputId);
  if (!el) return 0;
  const raw = typeof el.value === "string" ? el.value.replace(",", ".") : el.value;
  const num = parseFloat(raw);
  return Number.isFinite(num) ? num : 0;
}

/**
 * Format percent.
 */
function formatPercent(decimal) {
  if (!Number.isFinite(decimal)) return "–";
  return (decimal * 100).toFixed(2) + " %";
}

/**
 * Format currency.
 */
function formatCurrency(value) {
  if (!Number.isFinite(value)) return "–";
  return value.toFixed(2) + " €";
}

function getStatus(metric, value) {
  if (!Number.isFinite(value)) return "";

  switch (metric) {
    case "grossYield":
      if (value > 0.08) return "status-green";
      if (value >= 0.05) return "status-orange";
      return "status-red";
    case "netYield":
      if (value > 0.06) return "status-green";
      if (value >= 0.035) return "status-orange";
      return "status-red";
    case "netNetYield":
      if (value > 0.045) return "status-green";
      if (value >= 0.025) return "status-orange";
      return "status-red";
    case "cfBefore":
      if (value > 150) return "status-green";
      if (value >= 0) return "status-orange";
      return "status-red";
    case "cfAfter":
      if (value > 50) return "status-green";
      if (value >= 0) return "status-orange";
      return "status-red";
    case "risk":
      if (value > 0.15) return "status-green";
      if (value >= 0.05) return "status-orange";
      return "status-red";
    default:
      return "";
  }
}

function applyStatus(el, status) {
  if (!el) return;
  STATUS_CLASSES.forEach((cls) => el.classList.remove(cls));
  if (status) el.classList.add(status);
}

function toggleNetMetrics(show) {
  const netEls = document.querySelectorAll(".net-required");
  netEls.forEach((el) => {
    el.classList.toggle("hidden", !show);
    if (!show) {
      el.setAttribute("title", NET_TOOLTIP);
    } else {
      el.removeAttribute("title");
    }
  });

  const netWarning = document.getElementById("netWarning");
  if (netWarning) {
    netWarning.classList.toggle("hidden", show);
  }
}

/**
 * Update DOM results.
 */
function updateResultsUI({
  grossYield,
  netYield,
  netNetYield,
  cfBefore,
  cfAfter,
  riskRatio,
  showNetMetrics
}) {
  const grossEl = document.getElementById("grossYield");
  const netEl = document.getElementById("netYield");
  const netNetEl = document.getElementById("netNetYield");
  const cfBeforeEl = document.getElementById("cfBeforeTax");
  const cfAfterEl = document.getElementById("cfAfterTax");
  const riskEl = document.getElementById("riskRatio");

  if (!grossEl || !netEl || !netNetEl || !cfBeforeEl || !cfAfterEl) return;

  toggleNetMetrics(showNetMetrics);

  grossEl.textContent = formatPercent(grossYield);
  const unavailableText = "Profil requis";
  applyStatus(grossEl, getStatus("grossYield", grossYield));

  if (showNetMetrics) {
    netEl.textContent = formatPercent(netYield);
    netNetEl.textContent = Number.isFinite(netNetYield)
      ? formatPercent(netNetYield)
      : "–";
    cfAfterEl.textContent = formatCurrency(cfAfter);
    applyStatus(netEl, getStatus("netYield", netYield));
    applyStatus(netNetEl, getStatus("netNetYield", netNetYield));
    applyStatus(cfAfterEl, getStatus("cfAfter", cfAfter));
  } else {
    netEl.textContent = unavailableText;
    netNetEl.textContent = unavailableText;
    cfAfterEl.textContent = unavailableText;
    applyStatus(netEl, "");
    applyStatus(netNetEl, "");
    applyStatus(cfAfterEl, "");
  }

  cfBeforeEl.textContent = formatCurrency(cfBefore);
  applyStatus(cfBeforeEl, getStatus("cfBefore", cfBefore));

  cfBeforeEl.classList.remove("positive", "negative");
  cfAfterEl.classList.remove("positive", "negative");

  if (cfBefore > 0) cfBeforeEl.classList.add("positive");
  if (cfBefore < 0) cfBeforeEl.classList.add("negative");
  if (showNetMetrics) {
    if (cfAfter > 0) cfAfterEl.classList.add("positive");
    if (cfAfter < 0) cfAfterEl.classList.add("negative");
  }

  if (riskEl) {
    riskEl.textContent = Number.isFinite(riskRatio)
      ? formatPercent(riskRatio)
      : "–";
    applyStatus(riskEl, getStatus("risk", riskRatio));
  }
}

/**
 * Update profile summary.
 */
function updateProfileSummary(profile, isSaved) {
  const summaryEl = document.getElementById("profileSummaryText");
  if (!summaryEl) return;

  const rentalLabel = profile.rentalType === "nu" ? "Nue" : "Meublée";
  let regimeLabel = "";
  switch (profile.taxRegime) {
    case "micro-foncier":
      regimeLabel = "Micro-foncier";
      break;
    case "reel-foncier":
      regimeLabel = "Réel foncier";
      break;
    case "micro-bic":
      regimeLabel = "Micro-BIC";
      break;
    case "reel-bic":
      regimeLabel = "Réel BIC";
      break;
    default:
      regimeLabel = profile.taxRegime;
  }

  const socialLabel = profile.includeSocialTaxes ? "avec PS" : "sans PS";

  if (!isSaved) {
    summaryEl.textContent = "Profil incomplet – renseignez vos infos pour activer la fiscalité.";
  } else {
    summaryEl.textContent = `${rentalLabel} · ${regimeLabel} · TMI ${profile.tmi} % · ${socialLabel}`;
  }
}

/**
 * Apply profile to modal inputs.
 */
function fillProfileForm(profile) {
  const rentalRadios = document.querySelectorAll("input[name='rentalType']");
  rentalRadios.forEach((radio) => {
    radio.checked = radio.value === profile.rentalType;
  });

  const tmiSelect = document.getElementById("tmi");
  if (tmiSelect) {
    tmiSelect.value = String(profile.tmi);
  }

  const includeSocial = document.getElementById("includeSocialTaxes");
  if (includeSocial) {
    includeSocial.checked = !!profile.includeSocialTaxes;
  }

  const vacancyInput = document.getElementById("vacancyRate");
  if (vacancyInput) {
    vacancyInput.value = profile.vacancyRate;
  }

  setupTaxRegimeOptions(profile.rentalType);
  const taxRegimeSelect = document.getElementById("taxRegime");
  if (taxRegimeSelect) {
    taxRegimeSelect.value = profile.taxRegime;
  }
}

/**
 * Read profile from modal form.
 */
function buildProfileFromForm() {
  const rentalType =
    document.querySelector("input[name='rentalType']:checked")?.value ||
    defaultProfile.rentalType;

  const taxRegimeSelect = document.getElementById("taxRegime");
  const taxRegime = taxRegimeSelect?.value || defaultProfile.taxRegime;

  const tmiSelect = document.getElementById("tmi");
  const tmi = tmiSelect ? Number(tmiSelect.value) || defaultProfile.tmi : defaultProfile.tmi;

  const includeSocial = document.getElementById("includeSocialTaxes");
  const includeSocialTaxes = includeSocial ? includeSocial.checked : defaultProfile.includeSocialTaxes;

  const vacancyInput = document.getElementById("vacancyRate");
  const vacancyRate = vacancyInput
    ? Number(vacancyInput.value) || defaultProfile.vacancyRate
    : defaultProfile.vacancyRate;

  return {
    rentalType,
    taxRegime,
    tmi,
    includeSocialTaxes,
    vacancyRate
  };
}

/**
 * Setup tax regime select options based on rentalType.
 */
function setupTaxRegimeOptions(rentalType) {
  const select = document.getElementById("taxRegime");
  if (!select) return;

  select.innerHTML = "";

  if (rentalType === "nu") {
    select.append(
      new Option("Micro-foncier", "micro-foncier"),
      new Option("Réel foncier", "reel-foncier")
    );
  } else {
    select.append(
      new Option("Micro-BIC (LMNP simplifié)", "micro-bic"),
      new Option("Réel BIC (LMNP réel)", "reel-bic")
    );
  }
}

/**
 * Open / close profile modal.
 */
function openProfileModal() {
  const backdrop = document.getElementById("profileModalBackdrop");
  if (backdrop) backdrop.classList.add("visible");
}

function closeProfileModal() {
  const backdrop = document.getElementById("profileModalBackdrop");
  if (backdrop) backdrop.classList.remove("visible");
}

/**
 * Main calculation handler.
 */
function handlePropertyFormSubmit(event, profile, isProfileSaved) {
  event.preventDefault();

  const purchasePrice = getNumberValue("purchasePrice");
  const buyingCosts = getNumberValue("buyingCosts");
  const monthlyRent = getNumberValue("monthlyRent");
  const monthlyCharges = getNumberValue("monthlyCharges");
  const annualDebtService = getNumberValue("annualDebtService");

  const annualRentRaw = monthlyRent * 12;
  const annualCharges = monthlyCharges * 12;

  const vacancyRate = (profile.vacancyRate || 0) / 100;
  const annualRent = annualRentRaw * (1 - vacancyRate);

  const totalInvestment = purchasePrice + buyingCosts;

  const grossYield = computeGrossYield(annualRent, totalInvestment);
  const netYield = computeNetYieldBeforeTax(
    annualRent,
    annualCharges,
    totalInvestment
  );
  const cfBefore = computeMonthlyCashflowBeforeTax(
    annualRent,
    annualCharges,
    annualDebtService
  );
  const monthlyRentNet = annualRent / 12;
  const riskRatio =
    monthlyRentNet > 0 ? cfBefore / monthlyRentNet : NaN;

  const { netNetYield, monthlyCashflowAfterTax } = computeAfterTaxMetrics({
    annualRent,
    annualCharges,
    annualDebtService,
    totalInvestment,
    profile
  });

  updateResultsUI({
    grossYield,
    netYield,
    netNetYield,
    cfBefore,
    cfAfter: monthlyCashflowAfterTax,
    riskRatio,
    showNetMetrics: isProfileSaved
  });

  return {
    grossYield,
    riskRatio
  };
}

/**
 * Reset results.
 */
function resetResults(showNetMetrics = false) {
  updateResultsUI({
    grossYield: NaN,
    netYield: NaN,
    netNetYield: NaN,
    cfBefore: NaN,
    cfAfter: NaN,
    riskRatio: NaN,
    showNetMetrics
  });
}

/**
 * Register service worker for PWA.
 */
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./sw.js")
        .catch((err) => console.error("SW registration failed:", err));
    });
  }
}

/**
 * Init app.
 */
document.addEventListener("DOMContentLoaded", () => {
  const propertyForm = document.getElementById("property-form");
  const resetBtn = document.getElementById("resetBtn");
  const prevStepBtn = document.getElementById("prevStepBtn");
  const nextStepBtn = document.getElementById("nextStepBtn");
  const submitBtn = document.getElementById("submitBtn");
  const wizardSteps = Array.from(document.querySelectorAll(".step"));
  const stepLabel = document.getElementById("wizardStepLabel");
  const stepTitle = document.getElementById("wizardStepTitle");
  const progressBar = document.getElementById("wizardProgressBar");
  const profileBtn = document.getElementById("profileBtn");
  const profileClose = document.getElementById("profileModalClose");
  const profileBackdrop = document.getElementById("profileModalBackdrop");
  const profileForm = document.getElementById("profile-form");
  const profileResetBtn = document.getElementById("profileResetBtn");
  const resultsCard = document.getElementById("results");
  const overlay = document.getElementById("yieldOverlay");
  const overlayValue = document.getElementById("overlayYieldValue");
  const overlayCloseBtn = document.getElementById("overlayCloseBtn");
  const toggleDebtButton = document.getElementById("toggleDebtField");
  const debtFieldWrap = document.getElementById("debtFieldWrap");
  const debtInfoBtn = document.getElementById("debtInfo");
  const debtTooltip = document.getElementById("debtTooltip");
  let currentProfile = { ...defaultProfile };
  let currentStepIndex = 0;
  let profileSaved = false;

  const stepTitles = [
    "Acquisition et financement",
    "Revenus et charges"
  ];

  function showResultsCard() {
    if (resultsCard) resultsCard.classList.remove("hidden");
  }

  function hideResultsCard() {
    if (resultsCard) resultsCard.classList.add("hidden");
  }

  function showOverlay(grossYield) {
    if (!overlay || !overlayValue) return;
    overlayValue.textContent = formatPercent(grossYield);
    applyStatus(overlayValue, getStatus("grossYield", grossYield));
    overlay.classList.remove("hidden");
    overlay.classList.add("visible");
  }

  function hideOverlay() {
    if (!overlay) return;
    overlay.classList.add("hidden");
    overlay.classList.remove("visible");
  }

  function validateCurrentStep() {
    const step = wizardSteps[currentStepIndex];
    if (!step) return true;
    const inputs = Array.from(step.querySelectorAll("input"));
    return inputs.every((input) => input.reportValidity());
  }

  function updateWizard(stepIndex) {
    if (!wizardSteps.length) return;
    currentStepIndex = Math.max(0, Math.min(stepIndex, wizardSteps.length - 1));

    wizardSteps.forEach((step, idx) => {
      step.classList.toggle("step-active", idx === currentStepIndex);
    });

    if (stepLabel) {
      stepLabel.textContent = `Étape ${currentStepIndex + 1} / ${wizardSteps.length}`;
    }
    if (stepTitle) {
      stepTitle.textContent = stepTitles[currentStepIndex] || "";
    }
    if (progressBar) {
      const width = ((currentStepIndex + 1) / wizardSteps.length) * 100;
      progressBar.style.width = `${width}%`;
    }

    if (prevStepBtn) {
      prevStepBtn.classList.toggle("hidden", currentStepIndex === 0);
    }
    if (nextStepBtn) {
      nextStepBtn.classList.toggle("hidden", currentStepIndex === wizardSteps.length - 1);
    }
    if (submitBtn) {
      submitBtn.classList.toggle("hidden", currentStepIndex !== wizardSteps.length - 1);
    }
  }

  function refreshProfileTooltip() {
    if (!profileBtn) return;
    if (!profileSaved) {
      profileBtn.title = "Renseignez vos infos pour calculer la rentabilité nette";
    } else {
      profileBtn.removeAttribute("title");
    }
  }

  function setProfileState(newProfile, isSaved) {
    currentProfile = newProfile;
    profileSaved = isSaved;
    updateProfileSummary(currentProfile, profileSaved);
    refreshProfileTooltip();
  }

  const { profile: loadedProfile, isSaved } = loadProfile();
  setProfileState(loadedProfile, isSaved);
  fillProfileForm(currentProfile);
  resetResults(profileSaved);
  hideResultsCard();
  hideOverlay();

  if (propertyForm) {
    propertyForm.addEventListener("submit", (e) => {
      const metrics = handlePropertyFormSubmit(e, currentProfile, profileSaved);
      showResultsCard();
      showOverlay(metrics?.grossYield);
    });
    propertyForm.addEventListener("reset", () => {
      currentStepIndex = 0;
      updateWizard(currentStepIndex);
      resetResults(profileSaved);
      hideResultsCard();
      hideOverlay();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      resetResults(profileSaved);
      hideResultsCard();
      hideOverlay();
    });
  }

  if (prevStepBtn) {
    prevStepBtn.addEventListener("click", () => {
      updateWizard(currentStepIndex - 1);
    });
  }

  if (nextStepBtn) {
    nextStepBtn.addEventListener("click", () => {
      if (!validateCurrentStep()) return;
      updateWizard(currentStepIndex + 1);
    });
  }

  if (overlayCloseBtn) {
    overlayCloseBtn.addEventListener("click", () => {
      hideOverlay();
      showResultsCard();
    });
  }

  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        hideOverlay();
        showResultsCard();
      }
    });
  }

  if (toggleDebtButton && debtFieldWrap) {
    toggleDebtButton.addEventListener("click", () => {
      const isHidden = debtFieldWrap.classList.toggle("hidden");
      toggleDebtButton.textContent = isHidden
        ? "Ajouter l'annuité de crédit (optionnel)"
        : "Masquer l'annuité de crédit";
    });
  }

  const hideDebtTooltip = () => {
    if (debtTooltip) debtTooltip.classList.remove("visible");
  };

  if (debtInfoBtn && debtTooltip) {
    hideDebtTooltip();
    debtInfoBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      debtTooltip.classList.toggle("visible");
    });
    debtInfoBtn.addEventListener("mouseenter", () => debtTooltip.classList.add("visible"));
    debtInfoBtn.addEventListener("mouseleave", hideDebtTooltip);
    debtInfoBtn.addEventListener("blur", hideDebtTooltip);
    document.addEventListener("click", (e) => {
      if (e.target !== debtInfoBtn && !debtTooltip.contains(e.target)) {
        hideDebtTooltip();
      }
    });
  }

  if (profileBtn) {
    profileBtn.addEventListener("click", () => openProfileModal());
  }

  if (profileClose) {
    profileClose.addEventListener("click", () => closeProfileModal());
  }

  if (profileBackdrop) {
    profileBackdrop.addEventListener("click", (e) => {
      if (e.target === profileBackdrop) closeProfileModal();
    });
  }

  // Change tax regime options when rentalType changes
  const rentalRadios = document.querySelectorAll("input[name='rentalType']");
  rentalRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      setupTaxRegimeOptions(radio.value);
    });
  });

  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newProfile = buildProfileFromForm();
      saveProfile(newProfile);
      setProfileState(newProfile, true);
      resetResults(profileSaved);
      closeProfileModal();
    });
  }

  if (profileResetBtn) {
    profileResetBtn.addEventListener("click", () => {
      clearProfile();
      const resetProfile = { ...defaultProfile };
      fillProfileForm(resetProfile);
      setProfileState(resetProfile, false);
      resetResults(profileSaved);
    });
  }

  updateWizard(0);
  registerServiceWorker();
});
