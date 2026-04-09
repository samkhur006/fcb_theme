let displayValue = '0';
let firstOperand = null;
let waitingForSecondOperand = false;
let operator = null;

function inputDigit(digit) {
  if (waitingForSecondOperand) {
    displayValue = digit;
    waitingForSecondOperand = false;
  } else {
    displayValue = displayValue === '0' ? digit : displayValue + digit;
  }
}

function inputDecimal(dot) {
  if (waitingForSecondOperand) {
    displayValue = '0.';
    waitingForSecondOperand = false;
    return;
  }
  if (!displayValue.includes(dot)) {
    displayValue += dot;
  }
}

function handleOperator(nextOperator) {
  const inputValue = parseFloat(displayValue);
  if (operator && waitingForSecondOperand) {
    operator = nextOperator;
    return;
  }
  if (firstOperand === null && !isNaN(inputValue)) {
    firstOperand = inputValue;
  } else if (operator) {
    const result = performCalculation[operator](firstOperand, inputValue);
    if (isFinite(result)) {
      displayValue = String(result);
      firstOperand = result;
    } else {
      displayValue = 'Error';
      firstOperand = null;
    }
  }
  waitingForSecondOperand = true;
  operator = nextOperator;
}

const performCalculation = {
  '/': (a, b) => a / b,
  '*': (a, b) => a * b,
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '=': (a, b) => b
};

function resetCalculator() {
  displayValue = '0';
  firstOperand = null;
  waitingForSecondOperand = false;
  operator = null;
}

function updateDisplay(displayElem) {
  displayElem.textContent = displayValue;
}

function createCalculatorPopup() {
  const existing = document.getElementById("calculatorPopup");
  if (existing) {
    existing.remove();
    return;
  }

  const popup = document.createElement("div");
  popup.id = "calculatorPopup";
  popup.className = "toolPopup";

  // Kapatma butonunu önce ekle
  const closeBtn = document.createElement("button");
  closeBtn.className = "calc-close";
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener("click", () => popup.remove());
  popup.appendChild(closeBtn);

  // Hesap makinesi arayüzünü ekle
  popup.insertAdjacentHTML("beforeend", `
    <div id="calcDisplay" class="calc-display">0</div>
    <div class="calc-keys">
      <button type="button" data-action="clear">C</button>
      <button type="button" data-action="plus-minus">±</button>
      <button type="button" data-action="percent">%</button>
      <button type="button" data-action="/">÷</button>

      <button type="button">7</button>
      <button type="button">8</button>
      <button type="button">9</button>
      <button type="button" data-action="*">×</button>

      <button type="button">4</button>
      <button type="button">5</button>
      <button type="button">6</button>
      <button type="button" data-action="-">−</button>

      <button type="button">1</button>
      <button type="button">2</button>
      <button type="button">3</button>
      <button type="button" data-action="+">+</button>

      <button type="button" class="zero">0</button>
      <button type="button">.</button>
      <button type="button" data-action="=">=</button>
    </div>
  `);

  document.body.appendChild(popup);

  const displayElem = popup.querySelector('#calcDisplay');
  const keys = popup.querySelector('.calc-keys');
  updateDisplay(displayElem);

  keys.addEventListener('click', (e) => {
    const target = e.target;
    if (!target.matches('button')) return;

    const action = target.dataset.action;
    const key = target.textContent;

    if (!action) {
      key === '.' ? inputDecimal(key) : inputDigit(key);
    } else if (action === 'clear') {
      resetCalculator();
    } else if (action === 'plus-minus') {
      displayValue = (parseFloat(displayValue) * -1).toString();
    } else if (action === 'percent') {
      displayValue = (parseFloat(displayValue) / 100).toString();
    } else {
      handleOperator(action);
    }
    updateDisplay(displayElem);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const calcIcon = document.getElementById("calculatorIcon");
  if (calcIcon) calcIcon.addEventListener("click", createCalculatorPopup);
});
