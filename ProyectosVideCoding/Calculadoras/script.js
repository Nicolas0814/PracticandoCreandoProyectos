        // Variables para almacenar los operandos y la operación
        let currentOperand = '0';
        let previousOperand = '';
        let operation = null;
        let resetScreen = false;

        // Referencias a los elementos del DOM
        const currentOperandElement = document.getElementById('current-operand');
        const previousOperandElement = document.getElementById('previous-operand');
        const numberButtons = document.querySelectorAll('[data-number]');
        const operationButtons = document.querySelectorAll('[data-operation]');
        const equalsButton = document.getElementById('equals');
        const clearButton = document.getElementById('clear');
        const deleteButton = document.getElementById('delete');



        console.log("Hola mundo");
        // Función para actualizar la pantalla de la calculadora
        function updateDisplay() {
            currentOperandElement.textContent = currentOperand;
            
            if (operation != null) {
                previousOperandElement.textContent = `${previousOperand} ${operation}`;
            } else {
                previousOperandElement.textContent = previousOperand;
            }
        }

        // Función para agregar un número
        function appendNumber(number) {
            // Si la pantalla muestra "0" o debe reiniciarse, reemplazar el valor
            if (currentOperand === '0' || resetScreen) {
                currentOperand = number;
                resetScreen = false;
            } else {
                // Evitar múltiples puntos decimales
                if (number === '.' && currentOperand.includes('.')) return;
                currentOperand += number;
            }
            
            updateDisplay();
        }

        // Función para seleccionar una operación
        function chooseOperation(op) {
            // Si ya hay una operación pendiente, calcular primero
            if (operation !== null && !resetScreen) {
                compute();
            }
            
            // Si no hay un valor actual, no hacer nada
            if (currentOperand === '') return;
            
            operation = op;
            previousOperand = currentOperand;
            resetScreen = true;
            updateDisplay();
        }

        // Función para realizar el cálculo
        function compute() {
            let computation;
            const prev = parseFloat(previousOperand);
            const current = parseFloat(currentOperand);
            
            // Verificar que los operandos sean números válidos
            if (isNaN(prev) || isNaN(current)) return;
            
            // Realizar la operación correspondiente
            switch (operation) {
                case '+':
                    computation = prev + current;
                    break;
                case '-':
                    computation = prev - current;
                    break;
                case '×':
                    computation = prev * current;
                    break;
                case '÷':
                    if (current === 0) {
                        alert("Error: No se puede dividir entre cero");
                        clear();
                        return;
                    }
                    computation = prev / current;
                    break;
                default:
                    return;
            }
            
            // Actualizar el valor actual con el resultado
            currentOperand = computation.toString();
            operation = null;
            previousOperand = '';
            resetScreen = true;
            updateDisplay();
        }

        // Función para borrar todo
        function clear() {
            currentOperand = '0';
            previousOperand = '';
            operation = null;
            updateDisplay();
        }

        // Función para borrar el último dígito
        function deleteNumber() {
            if (currentOperand.length === 1 || (currentOperand.length === 2 && currentOperand.startsWith('-'))) {
                currentOperand = '0';
            } else {
                currentOperand = currentOperand.slice(0, -1);
            }
            updateDisplay();
        }

        // Event listeners para los botones de números
        numberButtons.forEach(button => {
            button.addEventListener('click', () => {
                appendNumber(button.getAttribute('data-number'));
            });
        });

        // Event listeners para los botones de operaciones
        operationButtons.forEach(button => {
            button.addEventListener('click', () => {
                chooseOperation(button.getAttribute('data-operation'));
            });
        });

        // Event listener para el botón de igual
        equalsButton.addEventListener('click', () => {
            compute();
        });

        // Event listener para el botón de limpiar (AC)
        clearButton.addEventListener('click', () => {
            clear();
        });

        // Event listener para el botón de borrar
        deleteButton.addEventListener('click', () => {
            deleteNumber();
        });

        // Manejo del teclado
        document.addEventListener('keydown', event => {
            // Evitar el comportamiento predeterminado para las teclas de la calculadora
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

            // Mapeo de teclas a funciones
            if (event.key >= '0' && event.key <= '9') {
                appendNumber(event.key);
            }
            
            if (event.key === '.') {
                appendNumber('.');
            }
            
            if (event.key === '+') {
                chooseOperation('+');
            }
            
            if (event.key === '-') {
                chooseOperation('-');
            }
            
            if (event.key === '*') {
                chooseOperation('×');
            }
            
            if (event.key === '/') {
                chooseOperation('÷');
            }
            
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

        // Inicializar la pantalla
        updateDisplay();
