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

        // ========== FUNCIONES AUXILIARES ==========
        // Actualiza la pantalla (superior e inferior)
        function updateDisplay() {
            // Pantalla superior: muestra la última expresión evaluada (si existe) o la expresión actual
            if (lastExpression !== null) {
                previousOperandElement.textContent = lastExpression;
            } else {
                previousOperandElement.textContent = expression || '0';
            }
            // Pantalla inferior: muestra el operando actual
            currentOperandElement.textContent = currentOperand || '0';
        }

        // Extrae el último número de la expresión para actualizar currentOperand
        function updateCurrentFromExpression() {
            if (expression === '') {
                currentOperand = '0';
                return;
            }
            // Buscar el último número u operador
            const match = expression.match(/(\d+\.?\d*)$/);
            if (match) {
                currentOperand = match[0];
            } else {
                // Si termina con operador, mostramos el último número antes del operador?
                // O dejamos vacío (se mostrará 0 en updateDisplay)
                currentOperand = '';
            }
        }

        // Agrega un número o punto decimal
        function appendNumber(number) {
            // Si debemos reiniciar la expresión (después de un =), empezamos de nuevo
            if (shouldResetExpression) {
                expression = '';
                lastExpression = null;
                shouldResetExpression = false;
            }

            // Si no hay expresión o es "0", reemplazamos
            if (expression === '' || expression === '0') {
                expression = number;
                currentOperand = number;
            } else {
                // Evitar múltiples puntos decimales en el mismo número
                if (number === '.') {
                    // Buscar el último número en la expresión
                    const parts = expression.split(/[\+\-\×÷]/);
                    const lastNumber = parts[parts.length - 1];
                    if (lastNumber.includes('.')) {
                        return; // Ya tiene punto decimal
                    }
                }
                expression += number;
                currentOperand = currentOperand === '' ? number : currentOperand + number;
            }
            updateDisplay();
        }

        // Agrega un operador
        function chooseOperation(op) {
            // Si estamos en estado de reset (después de =), permitimos comenzar una nueva operación con el resultado
            if (shouldResetExpression) {
                // La expresión actual es el resultado, lo mantenemos como primer operando
                shouldResetExpression = false;
                lastExpression = null;
            }

            // Si la expresión está vacía, no hacemos nada (no se puede empezar con operador)
            if (expression === '') return;

            // Verificar el último carácter de la expresión
            const lastChar = expression[expression.length - 1];
            const operators = ['+', '-', '×', '÷'];

            if (operators.includes(lastChar)) {
                // Reemplazar el último operador
                expression = expression.slice(0, -1) + op;
            } else {
                expression += op;
            }
            // Reiniciamos currentOperand para el próximo número
            currentOperand = '';
            updateDisplay();
        }

        // Evalúa la expresión completa y muestra el resultado
        function compute() {
            // Si no hay expresión o termina con operador, no evaluar
            if (expression === '') return;
            const lastChar = expression[expression.length - 1];
            if (['+', '-', '×', '÷'].includes(lastChar)) {
                alert('La expresión no puede terminar con un operador');
                return;
            }

            try {
                // Reemplazar símbolos visuales por operadores de JavaScript
                let evalExpression = expression.replace(/×/g, '*').replace(/÷/g, '/');
                const result = eval(evalExpression);

                // Guardar en el historial
                addToHistory(expression, result);

                // Guardar la expresión evaluada para mostrarla arriba
                lastExpression = expression;
                // Actualizar la expresión actual con el resultado
                expression = result.toString();
                currentOperand = expression;
                shouldResetExpression = true;

                updateDisplay();
            } catch (error) {
                alert('Error en la expresión: ' + error.message);
            }
        }

        // Limpiar todo (AC)
        function clear() {
            expression = '';
            currentOperand = '0';
            lastExpression = null;
            shouldResetExpression = false;
            updateDisplay();
        }

        // Borrar el último carácter
        function deleteNumber() {
            if (shouldResetExpression) {
                // Si estamos después de un resultado, al borrar se reinicia todo
                clear();
                return;
            }

            if (expression.length > 0) {
                expression = expression.slice(0, -1);
                // Actualizar currentOperand basado en la nueva expresión
                updateCurrentFromExpression();
                // Si la expresión quedó vacía, mostramos 0
                if (expression === '') {
                    currentOperand = '0';
                }
                updateDisplay();
            }
        }

        // ========== FUNCIONES DEL HISTORIAL ==========
        function addToHistory(expr, res) {
            // Agregar al inicio del array (más reciente primero)
            history.unshift({ expression: expr, result: res });
            // Limitar a 10 elementos para no saturar
            if (history.length > 10) history.pop();
            renderHistory();
        }

        function renderHistory() {
            historyListElement.innerHTML = '';
            history.forEach(item => {
                const li = document.createElement('li');
                li.className = 'history-item';
                li.innerHTML = `
                    <span class="history-expression">${item.expression} =</span>
                    <span class="history-result">${item.result}</span>
                `;
                historyListElement.appendChild(li);
            });
            // Si no hay historial, mostrar mensaje
            if (history.length === 0) {
                const li = document.createElement('li');
                li.className = 'history-item';
                li.style.justifyContent = 'center';
                li.style.color = '#6c757d';
                li.textContent = 'No hay cálculos anteriores';
                historyListElement.appendChild(li);
            }
        }

        // ========== EVENT LISTENERS ==========
        // Botones de números
        numberButtons.forEach(button => {
            button.addEventListener('click', () => {
                appendNumber(button.getAttribute('data-number'));
            });
        });

        // Botones de operadores
        operationButtons.forEach(button => {
            button.addEventListener('click', () => {
                chooseOperation(button.getAttribute('data-operation'));
            });
        });

        // Botón igual
        equalsButton.addEventListener('click', () => {
            compute();
        });

        // Botón AC
        clearButton.addEventListener('click', () => {
            clear();
        });

        // Botón borrar
        deleteButton.addEventListener('click', () => {
            deleteNumber();
        });

        // ========== SOPORTE PARA TECLADO ==========
        document.addEventListener('keydown', event => {
            // Prevenir comportamiento por defecto de teclas que usamos
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

            // Números
            if (event.key >= '0' && event.key <= '9') {
                appendNumber(event.key);
            }
            // Punto decimal
            if (event.key === '.') {
                appendNumber('.');
            }
            // Operadores (mapear * y / a los símbolos visuales)
            if (event.key === '+') chooseOperation('+');
            if (event.key === '-') chooseOperation('-');
            if (event.key === '*') chooseOperation('×');
            if (event.key === '/') chooseOperation('÷');
            // Igual o Enter
            if (event.key === 'Enter' || event.key === '=') {
                compute();
            }
            // Escape para AC
            if (event.key === 'Escape') {
                clear();
            }
            // Backspace para borrar
            if (event.key === 'Backspace') {
                deleteNumber();
            }
        });

        // ========== INICIALIZACIÓN ==========
        // Mostrar pantalla inicial
        updateDisplay();
        renderHistory();