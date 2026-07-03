document.addEventListener("DOMContentLoaded", function () {

  const resultEl     = document.getElementById("result");
  const expressionEl = document.getElementById("expression");
  const historyEl    = document.getElementById("history");
  const copyToast    = document.getElementById("copy-toast");

  const MAX_DIGITS = 12;
  const MAX_HISTORY = 3;

  let currentValue      = "0";
  let previousValue     = "";
  let operator          = null;
  let shouldResetDisplay = false;
  let toastTimer        = null;

  // ───────── operator map ─────────

  const operations = {
    "+": (a, b) => a + b,
    "−": (a, b) => a - b,
    "×": (a, b) => a * b,
    "÷": (a, b) => b === 0 ? null : a / b,
  };

  // ───────── helpers ─────────

  function formatDisplay(value) {
    if (value === "Error") return value;
    const num = parseFloat(value);
    if (isNaN(num)) return "0";
    // Add comma separators for the integer part only
    const [intPart, decPart] = value.split(".");
    const formatted = parseInt(intPart, 10).toLocaleString("en-US");
    return decPart !== undefined ? `${formatted}.${decPart}` : formatted;
  }

  function formatNumber(num) {
    if (num === null) return "Error";
    const parsed = parseFloat(num);
    if (!isFinite(parsed) || isNaN(parsed)) return "Error";
    return parseFloat(parsed.toPrecision(10)).toString();
  }

  function updateDisplay(value) {
    // Auto-reset after error if a number is typed — handled in handleNumber
    resultEl.textContent = formatDisplay(value);
    resultEl.classList.toggle("small", resultEl.textContent.replace(/,/g, "").length > 9);
  }

  function calculate(a, op, b) {
    const fn = operations[op];
    if (!fn) return parseFloat(b);
    const result = fn(parseFloat(a), parseFloat(b));
    return result;
  }

  // ───────── history ─────────

  function addHistory(entry) {
    const li = document.createElement("li");
    li.textContent = entry;
    historyEl.appendChild(li);
    // Keep only last MAX_HISTORY items
    while (historyEl.children.length > MAX_HISTORY) {
      historyEl.removeChild(historyEl.firstChild);
    }
  }

  // ───────── copy result ─────────

  resultEl.addEventListener("click", function () {
    const raw = currentValue;
    if (raw === "Error" || raw === "0") return;

    navigator.clipboard.writeText(raw).then(() => {
      clearTimeout(toastTimer);
      copyToast.classList.add("show");
      toastTimer = setTimeout(() => copyToast.classList.remove("show"), 1500);
    });
  });

  // ───────── number input ─────────

  function handleNumber(num) {
    // Auto-recover from error state
    if (currentValue === "Error") {
      currentValue = "0";
      shouldResetDisplay = false;
    }

    if (shouldResetDisplay) {
      currentValue = num === "." ? "0." : num;
      shouldResetDisplay = false;
    } else {
      if (num === "." && currentValue.includes(".")) return;
      if (currentValue === "0" && num !== ".") {
        currentValue = num;
      } else {
        // Strip commas before length check
        if (currentValue.replace(/,/g, "").length >= MAX_DIGITS) return;
        currentValue += num;
      }
    }
    updateDisplay(currentValue);
  }

  // ───────── operator input ─────────

  function handleOperator(op) {
    if (currentValue === "Error") return;

    if (operator && !shouldResetDisplay) {
      const result = calculate(previousValue, operator, currentValue);
      currentValue = formatNumber(result);
      updateDisplay(currentValue);
    }

    previousValue = currentValue;
    operator = op;
    shouldResetDisplay = true;

    expressionEl.textContent = `${formatDisplay(previousValue)} ${operator}`;

    document.querySelectorAll(".key--operator").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.operator === op);
    });
  }

  // ───────── action handlers ─────────

  function handleClear() {
    currentValue      = "0";
    previousValue     = "";
    operator          = null;
    shouldResetDisplay = false;
    expressionEl.textContent = "";
    updateDisplay("0");
    document.querySelectorAll(".key--operator").forEach(btn => btn.classList.remove("active"));
  }

  function handleBackspace() {
    if (shouldResetDisplay || currentValue === "Error") {
      currentValue = "0";
      shouldResetDisplay = false;
      updateDisplay("0");
      return;
    }
    if (currentValue.length > 1) {
      currentValue = currentValue.slice(0, -1);
    } else {
      currentValue = "0";
    }
    updateDisplay(currentValue);
  }

  function handlePercent() {
    if (currentValue === "Error") return;
    currentValue = formatNumber(parseFloat(currentValue) / 100);
    updateDisplay(currentValue);
  }

  function handleEquals() {
    if (!operator || shouldResetDisplay) return;

    const result = calculate(previousValue, operator, currentValue);
    const entry  = `${formatDisplay(previousValue)} ${operator} ${formatDisplay(currentValue)} = ${formatDisplay(formatNumber(result))}`;

    addHistory(entry);
    expressionEl.textContent = `${formatDisplay(previousValue)} ${operator} ${formatDisplay(currentValue)} =`;

    currentValue = formatNumber(result);
    updateDisplay(currentValue);

    operator      = null;
    previousValue = "";
    shouldResetDisplay = true;

    document.querySelectorAll(".key--operator").forEach(btn => btn.classList.remove("active"));
  }

  // ───────── event delegation ─────────

  document.querySelector(".calculator__keys").addEventListener("click", function (e) {
    const key = e.target.closest(".key");
    if (!key) return;

    if (key.dataset.number !== undefined) {
      handleNumber(key.dataset.number);
    } else if (key.dataset.operator) {
      handleOperator(key.dataset.operator);
    } else if (key.dataset.action) {
      switch (key.dataset.action) {
        case "clear":     handleClear();     break;
        case "backspace": handleBackspace(); break;
        case "percent":   handlePercent();   break;
        case "equals":    handleEquals();    break;
      }
    }
  });

  // ───────── keyboard support ─────────

  document.addEventListener("keydown", function (e) {
    if (e.key >= "0" && e.key <= "9") handleNumber(e.key);
    else if (e.key === ".")           handleNumber(".");
    else if (e.key === "+")           handleOperator("+");
    else if (e.key === "-")           handleOperator("−");
    else if (e.key === "*")           handleOperator("×");
    else if (e.key === "/")           { e.preventDefault(); handleOperator("÷"); }
    else if (e.key === "Enter" || e.key === "=") handleEquals();
    else if (e.key === "Backspace")   handleBackspace();
    else if (e.key === "Escape")      handleClear();
    else if (e.key === "%")           handlePercent();
  });

  // ───────── init ─────────
  updateDisplay("0");

});

