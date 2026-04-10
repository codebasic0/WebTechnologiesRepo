// Scientific Calculator JavaScript

class Calculator {
    constructor() {
        this.display = document.getElementById('display');
        this.currentValue = '';
        this.history = JSON.parse(localStorage.getItem('calcHistory')) || [];
        this.isScientificMode = false;
        this.setupEventListeners();
        this.renderHistory();
    }

    setupEventListeners() {
        // Mode buttons
        document.getElementById('standardMode').addEventListener('click', () => this.switchMode(false));
        document.getElementById('scientificMode').addEventListener('click', () => this.switchMode(true));

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    switchMode(scientific) {
        this.isScientificMode = scientific;
        document.getElementById('standardMode').classList.toggle('active', !scientific);
        document.getElementById('scientificMode').classList.toggle('active', scientific);
        document.getElementById('standardButtons').style.display = scientific ? 'none' : 'grid';
        document.getElementById('scientificButtons').style.display = scientific ? 'grid' : 'none';
    }

    appendValue(value) {
        this.currentValue += value;
        this.updateDisplay();
    }

    updateDisplay() {
        this.display.value = this.currentValue;
    }

    clear() {
        this.currentValue = '';
        this.updateDisplay();
    }

    backspace() {
        this.currentValue = this.currentValue.slice(0, -1);
        this.updateDisplay();
    }

    calculate() {
        try {
            let result = eval(this.currentValue);
            if (!isFinite(result)) {
                alert('Math Error: Result is not a valid number');
                return;
            }
            result = Math.round(result * 100000000) / 100000000; // Round to prevent floating point errors
            this.addToHistory(this.currentValue, result);
            this.currentValue = result.toString();
            this.updateDisplay();
        } catch (error) {
            alert('Syntax Error: Check your calculation');
        }
    }

    sqrt() {
        try {
            let result = Math.sqrt(parseFloat(eval(this.currentValue)));
            this.addToHistory(`√(${this.currentValue})`, result);
            this.currentValue = result.toString();
            this.updateDisplay();
        } catch (error) {
            alert('Error calculating square root');
        }
    }

    power() {
        this.currentValue += '**2';
        this.updateDisplay();
    }

    sin() {
        try {
            let value = parseFloat(eval(this.currentValue));
            let result = Math.sin(value * Math.PI / 180); // Convert degrees to radians
            result = Math.round(result * 100000000) / 100000000;
            this.addToHistory(`sin(${value}°)`, result);
            this.currentValue = result.toString();
            this.updateDisplay();
        } catch (error) {
            alert('Error calculating sine');
        }
    }

    cos() {
        try {
            let value = parseFloat(eval(this.currentValue));
            let result = Math.cos(value * Math.PI / 180); // Convert degrees to radians
            result = Math.round(result * 100000000) / 100000000;
            this.addToHistory(`cos(${value}°)`, result);
            this.currentValue = result.toString();
            this.updateDisplay();
        } catch (error) {
            alert('Error calculating cosine');
        }
    }

    tan() {
        try {
            let value = parseFloat(eval(this.currentValue));
            let result = Math.tan(value * Math.PI / 180); // Convert degrees to radians
            result = Math.round(result * 100000000) / 100000000;
            this.addToHistory(`tan(${value}°)`, result);
            this.currentValue = result.toString();
            this.updateDisplay();
        } catch (error) {
            alert('Error calculating tangent');
        }
    }

    log() {
        try {
            let value = parseFloat(eval(this.currentValue));
            let result = Math.log10(value);
            if (!isFinite(result)) {
                alert('Math Error: Cannot calculate logarithm of this number');
                return;
            }
            result = Math.round(result * 100000000) / 100000000;
            this.addToHistory(`log(${value})`, result);
            this.currentValue = result.toString();
            this.updateDisplay();
        } catch (error) {
            alert('Error calculating logarithm');
        }
    }

    ln() {
        try {
            let value = parseFloat(eval(this.currentValue));
            let result = Math.log(value);
            if (!isFinite(result)) {
                alert('Math Error: Cannot calculate natural logarithm of this number');
                return;
            }
            result = Math.round(result * 100000000) / 100000000;
            this.addToHistory(`ln(${value})`, result);
            this.currentValue = result.toString();
            this.updateDisplay();
        } catch (error) {
            alert('Error calculating natural logarithm');
        }
    }

    factorial() {
        try {
            let value = parseInt(eval(this.currentValue));
            if (value < 0) {
                alert('Error: Factorial of negative number is not defined');
                return;
            }
            let result = 1;
            for (let i = 2; i <= value; i++) {
                result *= i;
            }
            this.addToHistory(`${value}!`, result);
            this.currentValue = result.toString();
            this.updateDisplay();
        } catch (error) {
            alert('Error calculating factorial');
        }
    }

    reciprocal() {
        try {
            let value = parseFloat(eval(this.currentValue));
            if (value === 0) {
                alert('Error: Cannot divide by zero');
                return;
            }
            let result = 1 / value;
            result = Math.round(result * 100000000) / 100000000;
            this.addToHistory(`1/${value}`, result);
            this.currentValue = result.toString();
            this.updateDisplay();
        } catch (error) {
            alert('Error calculating reciprocal');
        }
    }

    percent() {
        try {
            let value = parseFloat(eval(this.currentValue));
            let result = value / 100;
            this.currentValue = result.toString();
            this.updateDisplay();
        } catch (error) {
            alert('Error calculating percentage');
        }
    }

    addToHistory(expression, result) {
        const item = {
            expression: expression,
            result: result,
            timestamp: new Date().toLocaleTimeString()
        };
        this.history.unshift(item);
        if (this.history.length > 20) {
            this.history.pop();
        }
        localStorage.setItem('calcHistory', JSON.stringify(this.history));
        this.renderHistory();
    }

    renderHistory() {
        const historyDiv = document.getElementById('history');
        historyDiv.innerHTML = '';

        if (this.history.length === 0) {
            historyDiv.innerHTML = '<p style="color: #999; text-align: center;">No calculations yet</p>';
            return;
        }

        this.history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div><strong>${item.expression}</strong></div>
                <div class="history-item-result">= ${item.result}</div>
                <div style="font-size: 0.8rem; color: #999;">${item.timestamp}</div>
            `;
            div.style.cursor = 'pointer';
            div.addEventListener('click', () => {
                this.currentValue = item.result.toString();
                this.updateDisplay();
            });
            historyDiv.appendChild(div);
        });
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear the calculation history?')) {
            this.history = [];
            localStorage.removeItem('calcHistory');
            this.renderHistory();
        }
    }

    handleKeyboard(e) {
        const key = e.key;
        if (/[0-9+\-*/().]/.test(key)) {
            this.appendValue(key);
        } else if (key === 'Enter') {
            e.preventDefault();
            this.calculate();
        } else if (key === 'Backspace') {
            e.preventDefault();
            this.backspace();
        } else if (key === 'Escape') {
            this.clear();
        }
    }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new Calculator();
});
