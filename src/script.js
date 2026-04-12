document.addEventListener("DOMContentLoaded", function () {

  const resultEl = document.getElementById("result");
  const expressionEl = document.getElementById("expression");

  let currentValue = "0";
  let previousValue = "";
  let operator = null;
  let shouldResetDisplay = false;

  // ───────── helpers ─────────

  function updateDisplay(value) {
    // Limit display length and shrink font for long numbers
    resultEl.textContent = value;
    resultEl.classList.toggle("small", value.length > 9);
  }

  function formatNumber(num) {
    // Avoid floating-point display noise
    const parsed = parseFloat(num);
    if (isNaN(parsed)) return "Error";
    // Round to max 10 significant digits
    const result = parseFloat(parsed.toPrecision(10)).toString();
    return result;
  }

  function calculate(a, op, b) {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    switch (op) {
      case "+": return numA + numB;
      case "−": return numA - numB;
      case "×": return numA * numB;
      case "÷":
        if (numB === 0) return "Error";
        return numA / numB;
      default: return numB;
    }
  }

  // ───────── number input ─────────

  function handleNumber(num) {
    if (shouldResetDisplay) {
      currentValue = num === "." ? "0." : num;
      shouldResetDisplay = false;
    } else {
      if (num === "." && currentValue.includes(".")) return;
      if (currentValue === "0" && num !== ".") {
        currentValue = num;
      } else {
        if (currentValue.length >= 12) return; // cap length
        currentValue += num;
      }
    }
    updateDisplay(currentValue);
  }

  // ───────── operator input ─────────

  function handleOperator(op) {
    // If there's a pending calculation, resolve it first
    if (operator && !shouldResetDisplay) {
      const result = calculate(previousValue, operator, currentValue);
      currentValue = formatNumber(result);
      updateDisplay(currentValue);
    }

    previousValue = currentValue;
    operator = op;
    shouldResetDisplay = true;

    // Update expression display and highlight active operator
    expressionEl.textContent = `${previousValue} ${operator}`;

    // Highlight active operator button
    document.querySelectorAll(".key--operator").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.operator === op);
    });
  }

  // ───────── action handlers ─────────

  function handleClear() {
    currentValue = "0";
    previousValue = "";
    operator = null;
    shouldResetDisplay = false;
    expressionEl.textContent = "";
    updateDisplay("0");
    document.querySelectorAll(".key--operator").forEach(btn => btn.classList.remove("active"));
  }

  function handleSign() {
    if (currentValue === "0" || currentValue === "Error") return;
    currentValue = currentValue.startsWith("-")
      ? currentValue.slice(1)
      : "-" + currentValue;
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
    expressionEl.textContent = `${previousValue} ${operator} ${currentValue} =`;

    currentValue = formatNumber(result);
    updateDisplay(currentValue);

    operator = null;
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
        case "clear":   handleClear();   break;
        case "sign":    handleSign();    break;
        case "percent": handlePercent(); break;
        case "equals":  handleEquals();  break;
      }
    }
  });

  // ───────── keyboard support ─────────

  document.addEventListener("keydown", function (e) {
    if (e.key >= "0" && e.key <= "9") handleNumber(e.key);
    else if (e.key === ".") handleNumber(".");
    else if (e.key === "+") handleOperator("+");
    else if (e.key === "-") handleOperator("−");
    else if (e.key === "*") handleOperator("×");
    else if (e.key === "/") { e.preventDefault(); handleOperator("÷"); }
    else if (e.key === "Enter" || e.key === "=") handleEquals();
    else if (e.key === "Backspace") {
      // simple backspace: remove last character
      if (currentValue.length > 1 && !shouldResetDisplay) {
        currentValue = currentValue.slice(0, -1);
        updateDisplay(currentValue);
      } else {
        currentValue = "0";
        updateDisplay("0");
      }
    }
    else if (e.key === "Escape") handleClear();
    else if (e.key === "%") handlePercent();
  });

  // ───────── init ─────────
  updateDisplay("0");

});
