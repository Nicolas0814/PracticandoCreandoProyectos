let expression = '';
let currentOperand = '0';
let lastExpression = null;
let shouldResetExpression = false;
let history = [];

// ========== REFERENCIAS DOM ==========
const currentOperandElement = document.getElementById('current-operand');
const previousOperandElement = document.getElementById('previous-operand');
const historyListElement = document.getElementById('history-list');
const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const equalsButton = document.getElementById('equals');
const clearButton = document.getElementById('clear');
const deleteButton = document.getElementById('delete');
const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
const historyContainer = document.getElementById('historyContainer');

// ========== FUNCIÓN PARA FORMATEAR CON SEPARADORES DE MILES ==========
function formatNumberWithCommas(numStr) {
    if (!numStr || numStr === '') return numStr;
    // Separar parte entera y decimal
    let parts = numStr.split('.');
    let integerPart = parts[0];
    let decimalPart = parts[1] ? '.' + parts[1] : '';
    // Agregar comas a la parte entera
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return integerPart + decimalPart;
}

// ========== FUNCIONES AUXILIARES ==========
function updateDisplay() {
    // Pantalla superior: última expresión o expresión actual
    if (lastExpression !== null) {
        previousOperandElement.textContent = lastExpression;
    } else {
        previousOperandElement.textContent = expression || '0';
    }
    // Pantalla inferior: operando actual formateado con comas
    currentOperandElement.textContent = formatNumberWithCommas(currentOperand || '0');
}

function updateCurrentFromExpression() {
    if (expression === '') {
        currentOperand = '0';
        return;
    }
    const match = expression.match(/(\d+\.?\d*)$/);
    if (match) {
        currentOperand = match[0];
    } else {
        currentOperand = '';
    }
}

function appendNumber(number) {
    if (shouldResetExpression) {
        expression = '';
        lastExpression = null;
        shouldResetExpression = false;
    }

    if (expression === '' || expression === '0') {
        expression = number;
        currentOperand = number;
    } else {
        if (number === '.') {
            const parts = expression.split(/[\+\-\×÷]/);
            const lastNumber = parts[parts.length - 1];
            if (lastNumber.includes('.')) {
                return;
            }
        }
        expression += number;
        currentOperand = currentOperand === '' ? number : currentOperand + number;
    }
    updateDisplay();
}

function chooseOperation(op) {
    if (shouldResetExpression) {
        shouldResetExpression = false;
        lastExpression = null;
    }

    if (expression === '') return;

    const lastChar = expression[expression.length - 1];
    const operators = ['+', '-', '×', '÷'];

    if (operators.includes(lastChar)) {
        expression = expression.slice(0, -1) + op;
    } else {
        expression += op;
    }
    currentOperand = '';
    updateDisplay();
}

function compute() {
    if (expression === '') return;
    const lastChar = expression[expression.length - 1];
    if (['+', '-', '×', '÷'].includes(lastChar)) {
        alert('La expresión no puede terminar con un operador');
        return;
    }

    try {
        let evalExpression = expression.replace(/×/g, '*').replace(/÷/g, '/');
        const result = eval(evalExpression);

        addToHistory(expression, result);

        lastExpression = expression;
        expression = result.toString();
        currentOperand = expression;
        shouldResetExpression = true;

        updateDisplay();
    } catch (error) {
        alert('Error en la expresión: ' + error.message);
    }
}

function clear() {
    expression = '';
    currentOperand = '0';
    lastExpression = null;
    shouldResetExpression = false;
    updateDisplay();
}

function deleteNumber() {
    if (shouldResetExpression) {
        clear();
        return;
    }

    if (expression.length > 0) {
        expression = expression.slice(0, -1);
        updateCurrentFromExpression();
        if (expression === '') {
            currentOperand = '0';
        }
        updateDisplay();
    }
}

// ========== FUNCIONES DEL HISTORIAL ==========
function addToHistory(expr, res) {
    history.unshift({ expression: expr, result: res });
    if (history.length > 10) history.pop();
    renderHistory();
}

function renderHistory() {
    historyListElement.innerHTML = '';
    if (history.length === 0) {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.style.justifyContent = 'center';
        li.style.color = '#6c757d';
        li.textContent = 'No hay cálculos anteriores';
        historyListElement.appendChild(li);
    } else {
        history.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            // Formatear el resultado con comas
            const formattedResult = formatNumberWithCommas(item.result.toString());
            li.innerHTML = `
                <span class="history-expression">${item.expression}</span>
                <span class="history-result">${formattedResult}</span>
            `;
            historyListElement.appendChild(li);
        });
    }
}

// ========== EVENTO PARA MOSTRAR/OCULTAR HISTORIAL ==========
toggleHistoryBtn.addEventListener('click', () => {
    historyContainer.classList.toggle('visible');
    const btnText = toggleHistoryBtn.querySelector('span');
    if (historyContainer.classList.contains('visible')) {
        btnText.textContent = 'Ocultar historial';
    } else {
        btnText.textContent = 'Mostrar historial';
    }
});

// ========== EVENT LISTENERS DE LA CALCULADORA ==========
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        appendNumber(button.getAttribute('data-number'));
    });
});

operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        chooseOperation(button.getAttribute('data-operation'));
    });
});

equalsButton.addEventListener('click', () => {
    compute();
});

clearButton.addEventListener('click', () => {
    clear();
});

deleteButton.addEventListener('click', () => {
    deleteNumber();
});

// ========== SOPORTE PARA TECLADO ==========
document.addEventListener('keydown', event => {
    if (
        (event.key >= '0' && event.key <= '9') ||
        event.key === '.' ||
        event.key === '+' ||
        event.key === '-' ||
        event.key === '*' ||
        event.key === '/' ||
        event.key === 'Enter' ||
        event.key === 'Escape' ||
        event.key === 'Backspace'
    ) {
        event.preventDefault();
    }

    if (event.key >= '0' && event.key <= '9') {
        appendNumber(event.key);
    }
    if (event.key === '.') {
        appendNumber('.');
    }
    if (event.key === '+') chooseOperation('+');
    if (event.key === '-') chooseOperation('-');
    if (event.key === '*') chooseOperation('×');
    if (event.key === '/') chooseOperation('÷');
    if (event.key === 'Enter' || event.key === '=') {
        compute();
    }
    if (event.key === 'Escape') {
        clear();
    }
    if (event.key === 'Backspace') {
        deleteNumber();
    }
});

// ========== INICIALIZACIÓN ==========
updateDisplay();
renderHistory();