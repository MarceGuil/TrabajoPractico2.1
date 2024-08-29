
class Sensor {
    constructor(id, name, type, value, unit, updated_at) {
        this.id = id;
        this.name = name;
        this.type = this.validateType(type);
        this.value = value;
        this.unit = unit;
        this.updated_at = updated_at;
    }

    // Setter para actualizar el valor y la fecha de actualización
    set updateValue(newValue) {
        this.value = newValue;
        this.updated_at = new Date().toISOString(); // Actualiza la fecha automáticamente
    }

    // Validación del tipo de sensor
    validateType(type) {
        const validTypes = ['temperature', 'humidity', 'pressure'];
        if (!validTypes.includes(type)) {
            throw new Error(`Tipo de sensor no válido: ${type}`);
        }
        return type;
    }

    // Método para renderizar el sensor en la interfaz
    render() {
        return `
            <div class="column is-one-third">
                <div class="card">
                    <header class="card-header">
                        <p class="card-header-title">Sensor: ${this.name} (ID: ${this.id})</p>
                    </header>
                    <div class="card-content">
                        <div class="content">
                            <p><strong>Tipo:</strong> ${this.type}</p>
                            <p><strong>Valor:</strong> ${this.value} ${this.unit}</p>
                        </div>
                        <time datetime="${this.updated_at}">
                            Última actualización: ${new Date(this.updated_at).toLocaleString()}
                        </time>
                    </div>
                    <footer class="card-footer">
                        <a href="#" class="card-footer-item update-button" data-id="${this.id}">Actualizar</a>
                    </footer>
                </div>
            </div>
        `;
    }
}

class SensorManager {
    constructor() {
        this.sensors = [];
    }

    // Método asíncrono para cargar sensores desde un archivo JSON
    async loadSensors(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            this.sensors = data.map(sensorData => 
                new Sensor(
                    sensorData.id,
                    sensorData.name,
                    sensorData.type,
                    sensorData.value,
                    sensorData.unit,
                    sensorData.updated_at
                )
            );
            this.render(); // Llama al método render para mostrar los sensores
        } catch (error) {
            console.error('Error al cargar sensores:', error);
        }
    }

    // Método para actualizar el sensor y renderizarlo
    updateSensor(id) {
        const sensor = this.sensors.find((sensor) => sensor.id === id);
        if (sensor) {
            let newValue;
            switch (sensor.type) {
                case "temperature": // Rango de -30 a 50 grados Celsius
                    newValue = (Math.random() * 80 - 30).toFixed(2);
                    break;
                case "humidity": // Rango de 0 a 100%
                    newValue = (Math.random() * 100).toFixed(2);
                    break;
                case "pressure": // Rango de 960 a 1040 hPa
                    newValue = (Math.random() * 80 + 960).toFixed(2);
                    break;
                default:
                    newValue = (Math.random() * 100).toFixed(2);
            }
            sensor.updateValue = newValue;
            this.render();
        } else {
            console.error(`Sensor ID ${id} no encontrado`);
        }
    }

    // Método para renderizar la lista de sensores en la interfaz
    render() {
        const container = document.getElementById("sensor-container");
        container.innerHTML = "";
        this.sensors.forEach((sensor) => {
            const sensorCard = document.createElement("div");
            sensorCard.className = "column is-one-third";
            sensorCard.innerHTML = sensor.render();
            container.appendChild(sensorCard);
        });

        const updateButtons = document.querySelectorAll(".update-button");
        updateButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                const sensorId = parseInt(button.getAttribute("data-id"));
                this.updateSensor(sensorId);
            });
        });
    }
}

// Instanciar SensorManager y cargar sensores al cargar la página
const monitor = new SensorManager();
window.onload = () => {
    monitor.loadSensors("sensors.json");
};
