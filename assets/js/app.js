// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .catch((err) => {
        console.error("SW registration failed:", err);
      });
  });
}

/**
 * Compute gross rental yield based on simple inputs.
 */
function computeGrossYield(input) {
  const {
    monthlyRent,
    monthlyExtraIncome,
    propertyPrice,
    notaryRatePercent,
    initialWorks,
  } = input;

  // Total monthly rent (main rent + annex incomes)
  const totalMonthlyRent = (monthlyRent || 0) + (monthlyExtraIncome || 0);

  // Yearly rent
  const yearlyRent = totalMonthlyRent * 12;

  // Notary fees estimated from rate
  const notaryFees = (propertyPrice || 0) * (notaryRatePercent / 100);

  // Total project cost (property + notary + works)
  const totalCost = (propertyPrice || 0) + notaryFees + (initialWorks || 0);

  // Avoid division by zero or negative cost
  const grossYieldPercent =
    totalCost > 0 ? (yearlyRent / totalCost) * 100 : 0;

  return {
    totalMonthlyRent,
    yearlyRent,
    notaryFees,
    totalCost,
    grossYieldPercent,
  };
}

/**
 * Format a number as EUR currency with no decimals.
 */
function formatCurrencyEUR(value) {
  if (!isFinite(value)) return "–";
  return value.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

/**
 * Format a number as percent with one decimal.
 */
function formatPercent(value) {
  if (!isFinite(value)) return "– %";
  return (
    value.toLocaleString("fr-FR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + " %"
  );
}

/**
 * Initialize multi-step wizard UI.
 */
function initWizard() {
  const form = document.getElementById("grossYieldForm");
  const steps = Array.from(document.querySelectorAll(".step"));
  const prevStepBtn = document.getElementById("prevStepBtn");
  const nextStepBtn = document.getElementById("nextStepBtn");
  const submitBtn = document.getElementById("submitBtn");

  const stepLabel = document.getElementById("wizardStepLabel");
  const stepTitle = document.getElementById("wizardStepTitle");
  const progressBar = document.getElementById("wizardProgressBar");

  const notaryRateInput = document.getElementById("notaryRate");
  const notaryRateValue = document.getElementById("notaryRateValue");

  const resultsCard = document.getElementById("resultsCard");
  const grossYieldValue = document.getElementById("grossYieldValue");
  const yearlyRentValue = document.getElementById("yearlyRentValue");
  const monthlyTotalRentValue = document.getElementById(
    "monthlyTotalRentValue"
  );
  const totalCostValue = document.getElementById("totalCostValue");
  const notaryFeesValue = document.getElementById("notaryFeesValue");
  const initialWorksValue = document.getElementById("initialWorksValue");

  // Fullscreen overlay elements
  const yieldOverlay = document.getElementById("yieldOverlay");
  const overlayYieldValue = document.getElementById("overlayYieldValue");
  const overlayCloseBtn = document.getElementById("overlayCloseBtn");

  const stepTitles = {
    1: "Revenus locatifs",
    2: "Coût du projet",
  };

  let currentStepIndex = 0;

  function updateStepView() {
    steps.forEach((step, index) => {
      const isActive = index === currentStepIndex;
      step.classList.toggle("step-active", isActive);
      step.classList.toggle("hidden", !isActive);
    });

    const totalSteps = steps.length;
    const currentStepNumber = currentStepIndex + 1;

    stepLabel.textContent = `Étape ${currentStepNumber} / ${totalSteps}`;
    stepTitle.textContent = stepTitles[currentStepNumber] || "";

    const progressPercent = (currentStepNumber / totalSteps) * 100;
    progressBar.style.width = `${progressPercent}%`;

    if (currentStepIndex === 0) {
      prevStepBtn.classList.add("hidden");
    } else {
      prevStepBtn.classList.remove("hidden");
    }

    if (currentStepIndex === totalSteps - 1) {
      nextStepBtn.classList.add("hidden");
      submitBtn.classList.remove("hidden");
    } else {
      nextStepBtn.classList.remove("hidden");
      submitBtn.classList.add("hidden");
    }
  }

  function goToNextStep() {
    const currentStep = steps[currentStepIndex];
    const inputs = Array.from(
      currentStep.querySelectorAll("input[required]")
    );

    for (const input of inputs) {
      if (!input.reportValidity()) {
        return;
      }
    }

    if (currentStepIndex < steps.length - 1) {
      currentStepIndex += 1;
      updateStepView();
    }
  }

  function goToPrevStep() {
    if (currentStepIndex > 0) {
      currentStepIndex -= 1;
      updateStepView();
    }
  }

  // Update displayed notary rate when slider moves
  notaryRateInput.addEventListener("input", () => {
    notaryRateValue.textContent = notaryRateInput.value;
  });

  nextStepBtn.addEventListener("click", goToNextStep);
  prevStepBtn.addEventListener("click", goToPrevStep);

  // Close overlay and scroll to results
  overlayCloseBtn.addEventListener("click", () => {
    yieldOverlay.classList.add("hidden");
    resultsCard.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const requiredInputs = Array.from(
      form.querySelectorAll("input[required]")
    );
    for (const input of requiredInputs) {
      if (!input.reportValidity()) {
        return;
      }
    }

    const monthlyRent = parseFloat(
      document.getElementById("monthlyRent").value
    );
    const monthlyExtraIncome = parseFloat(
      document.getElementById("monthlyExtraIncome").value || "0"
    );
    const propertyPrice = parseFloat(
      document.getElementById("propertyPrice").value
    );
    const notaryRatePercent = parseFloat(notaryRateInput.value);
    const initialWorks = parseFloat(
      document.getElementById("initialWorks").value || "0"
    );

    const result = computeGrossYield({
      monthlyRent,
      monthlyExtraIncome,
      propertyPrice,
      notaryRatePercent,
      initialWorks,
    });

    // Update result card
    grossYieldValue.textContent = formatPercent(result.grossYieldPercent);
    yearlyRentValue.textContent = formatCurrencyEUR(result.yearlyRent);
    monthlyTotalRentValue.textContent = formatCurrencyEUR(
      result.totalMonthlyRent
    );
    totalCostValue.textContent = formatCurrencyEUR(result.totalCost);
    notaryFeesValue.textContent = formatCurrencyEUR(result.notaryFees);
    initialWorksValue.textContent = formatCurrencyEUR(initialWorks);

    resultsCard.classList.remove("hidden");

    // Update and show fullscreen overlay
    overlayYieldValue.textContent = formatPercent(result.grossYieldPercent);
    yieldOverlay.classList.remove("hidden");
  });

  updateStepView();
}

document.addEventListener("DOMContentLoaded", () => {
  initWizard();
});
