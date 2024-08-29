
class Currency {
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }
}

class CurrencyConverter {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.currencies = []; // Almacena las instancias de Currency
    }

    // Método para obtener las divisas desde la API
    async getCurrencies() {
        try {
            const response = await fetch(`${this.apiUrl}/currencies`);
            const data = await response.json();
            this.currencies = Object.entries(data).map(
                ([code, name]) => new Currency(code, name)
            );
        } catch (error) {
            console.error("Error fetching currencies:", error);
        }
    }

    // Método para convertir la moneda
    async convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency.code === toCurrency.code) {
            return amount; // No se realiza conversión si las monedas son iguales
        }

        try {
            const response = await fetch(
                `${this.apiUrl}/latest?amount=${amount}&from=${fromCurrency.code}&to=${toCurrency.code}`
            );
            const data = await response.json();
            return data.result; // Retorna el monto convertido
        } catch (error) {
            console.error("Error converting currency:", error);
            return null;
        }
    }

    // Método para obtener la diferencia de tasas de cambio entre hoy y ayer
    async getRateDifference(fromCurrency, toCurrency) {
        const todayRate = await this.getRateForDate(new Date().toISOString().split("T")[0], fromCurrency, toCurrency);
        const yesterdayRate = await this.getRateForDate(new Date(Date.now() - 86400000).toISOString().split("T")[0], fromCurrency, toCurrency);
        
        return todayRate - yesterdayRate; // Retorna la diferencia de tasas
    }

    // Método auxiliar para obtener la tasa para una fecha específica
    async getRateForDate(date, fromCurrency, toCurrency) {
        try {
            const response = await fetch(`${this.apiUrl}/${date}?from=${fromCurrency.code}&to=${toCurrency.code}`);
            const data = await response.json();
            return data[fromCurrency.code][toCurrency.code]; // Retorna la tasa de cambio
        } catch (error) {
            console.error("Error fetching rate for date:", error);
            return null;
        }
    }
}

// Manejo del DOM
document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("conversion-form");
    const resultDiv = document.getElementById("result");
    const fromCurrencySelect = document.getElementById("from-currency");
    const toCurrencySelect = document.getElementById("to-currency");

    const converter = new CurrencyConverter("https://api.frankfurter.app");

    await converter.getCurrencies(); // Obtener las divisas
    populateCurrencies(fromCurrencySelect, converter.currencies);
    populateCurrencies(toCurrencySelect, converter.currencies);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const amount = parseFloat(document.getElementById("amount").value);
        const fromCurrency = converter.currencies.find(
            (currency) => currency.code === fromCurrencySelect.value
        );
        const toCurrency = converter.currencies.find(
            (currency) => currency.code === toCurrencySelect.value
        );

        const convertedAmount = await converter.convertCurrency(amount, fromCurrency, toCurrency);

        if (convertedAmount !== null && !isNaN(convertedAmount)) {
            resultDiv.textContent = `${amount} ${fromCurrency.code} son ${convertedAmount.toFixed(2)} ${toCurrency.code}`;
        } else {
            resultDiv.textContent = "Error al realizar la conversión.";
        }
    });

    function populateCurrencies(selectElement, currencies) {
        if (currencies) {
            currencies.forEach((currency) => {
                const option = document.createElement("option");
                option.value = currency.code;
                option.textContent = `${currency.code} - ${currency.name}`;
                selectElement.appendChild(option);
            });
        }
    }
});
