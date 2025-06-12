import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import greenhouseService from '../../../services/greenhouseService';
import styles from './UserStatisticsPage.module.css';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale // Для осі часу
} from 'chart.js';
import 'chartjs-adapter-date-fns'; // Адаптер для дат

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
);

const SensorDataChart = ({ sensorData, sensor }) => {
    if (!sensorData || sensorData.length === 0) {
        return <p>Немає даних для відображення для датчика {sensor.type} ({sensor.model}).</p>;
    }

    const chartData = {
        labels: sensorData.map(d => new Date(d.timestamp)),
        datasets: [
            {
                label: `${sensor.type} (${sensor.unit})`,
                data: sensorData.map(d => d.value),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1,
                fill: false,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'hour', // Можна налаштувати (day, minute, etc.)
                    tooltipFormat: 'dd MMM yyyy HH:mm', // Формат для підказки
                     displayFormats: {
                        hour: 'HH:mm', // Формат міток на осі
                        day: 'dd MMM'
                    }
                },
                title: {
                    display: true,
                    text: 'Час',
                },
            },
            y: {
                title: {
                    display: true,
                    text: `Значення (${sensor.unit})`,
                },
                beginAtZero: false // Чи починати вісь Y з нуля
            },
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Історія показників: ${sensor.type} (${sensor.model})`,
            },
        },
    };

    return <div className={styles.chartContainer}><Line options={options} data={chartData} /></div>;
};

const SensorDataTable = ({ sensorData, sensor }) => {
     if (!sensorData || sensorData.length === 0) {
        return null; // Не показуємо таблицю, якщо немає даних
    }
    return (
        <div className={styles.tableContainerSmall}>
            <h4>Таблиця значень для: {sensor.type} ({sensor.model})</h4>
            <table className={styles.dataTableSmall}>
                <thead>
                    <tr>
                        <th>Час</th>
                        <th>Значення ({sensor.unit})</th>
                    </tr>
                </thead>
                <tbody>
                    {sensorData.slice(0, 10).map(d => ( // Показуємо, наприклад, останні 10
                        <tr key={d._id}>
                            <td>{new Date(d.timestamp).toLocaleString('uk-UA')}</td>
                            <td>{d.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


const UserStatisticsPage = () => {
    const { greenhouseId } = useParams(); // Припускаємо, що статистика для конкретної теплиці
    const navigate = useNavigate();
    const [greenhouse, setGreenhouse] = useState(null);
    const [sensors, setSensors] = useState([]);
    const [sensorDataMap, setSensorDataMap] = useState({}); // Об'єкт для зберігання даних кожного сенсора
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dateRange, setDateRange] = useState({ // Для фільтрації за датою
        start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0], // За замовчуванням - останній тиждень
        end: new Date().toISOString().split('T')[0]
    });

    const fetchGreenhouseAndSensors = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [ghData, sensorsData] = await Promise.all([
                greenhouseService.getMyGreenhouseById(greenhouseId),
                greenhouseService.getSensorsForMyGreenhouse(greenhouseId)
            ]);
            setGreenhouse(ghData);
            setSensors(sensorsData);
            // Після завантаження сенсорів, завантажуємо їх дані
            if (sensorsData.length > 0) {
                fetchDataForAllSensors(sensorsData, dateRange.start, dateRange.end);
            } else {
                setLoading(false);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || `Не вдалося завантажити дані теплиці.`);
            setLoading(false);
        }
    }, [greenhouseId, dateRange.start, dateRange.end]); // Додано dateRange

    const fetchDataForAllSensors = async (currentSensors, startDate, endDate) => {
        setLoading(true);
        const dataMap = {};
        try {
            for (const sensor of currentSensors) {
                if (sensor.status === 'active') {
                    const params = {};
                    if (startDate) params.startDate = new Date(startDate).toISOString();
                    if (endDate) {
                        // endDate тепер встановлюється на бекенді на кінець дня
                        params.endDate = new Date(endDate).toISOString().split('T')[0]; // Надсилаємо лише дату
                    }

                    const data = await greenhouseService.getSensorDataHistory(sensor._id, params);
                    // Тепер data - це просто масив
                    dataMap[sensor._id] = Array.isArray(data) ? data : []; 
                } else {
                    dataMap[sensor._id] = [];
                }
            }
            setSensorDataMap(dataMap);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Помилка завантаження історії показників.');
        }
        setLoading(false); // Має бути тут, щоб setLoading(false) викликався після всіх запитів
    };


    useEffect(() => {
        fetchGreenhouseAndSensors();
    }, [fetchGreenhouseAndSensors]); 


    const handleDateChange = (e) => {
        setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    if (loading && !greenhouse) return <div className={styles.statsPageContainer}><p>Завантаження даних...</p></div>;
    if (error && !greenhouse) return <div className={styles.statsPageContainer}><p className={styles.error}>{error}</p><button onClick={() => navigate('/my-greenhouses')}>До Моїх Теплиць</button></div>;
    if (!greenhouse) return <div className={styles.statsPageContainer}><p>Теплицю не знайдено або у вас немає доступу.</p></div>;

    return (
        <div className={styles.statsPageContainer}>
            <Link to={`/my-greenhouses/${greenhouseId}`} className={styles.backLink}>← Назад до деталей теплиці "{greenhouse.name}"</Link>
            <h2>Статистика для Теплиці: {greenhouse.name}</h2>
            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.dateFilterContainer}>
                <label htmlFor="startDate">З:</label>
                <input type="date" id="startDate" name="start" value={dateRange.start} onChange={handleDateChange} />
                <label htmlFor="endDate">По:</label>
                <input type="date" id="endDate" name="end" value={dateRange.end} onChange={handleDateChange} />
            </div>

            {loading && <p>Оновлення графіків...</p>}

            {sensors.length > 0 ? (
                sensors.filter(s => s.status === 'active').map(sensor => (
                    <div key={sensor._id} className={styles.sensorStatBlock}>
                        <h3>Статистика: {sensor.type} ({sensor.model})</h3>
                        <SensorDataChart sensorData={sensorDataMap[sensor._id]} sensor={sensor} />
                        <SensorDataTable sensorData={sensorDataMap[sensor._id]} sensor={sensor} />
                    </div>
                ))
            ) : (
                <p>Активних датчиків для відображення статистики не знайдено.</p>
            )}
             {sensors.some(s => s.status === 'inactive') && (
                <p className={styles.inactiveSensorsNote}>Деякі датчики неактивні і їх дані не відображаються.</p>
            )}
        </div>
    );
};

export default UserStatisticsPage;