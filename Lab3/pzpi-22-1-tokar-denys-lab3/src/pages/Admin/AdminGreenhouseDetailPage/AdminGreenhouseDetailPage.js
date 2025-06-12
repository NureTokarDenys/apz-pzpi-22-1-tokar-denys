import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminService from '../../../services/adminService';
import styles from './AdminGreenhouseDetailPage.module.css';

const SensorFormModal = ({ greenhouseId, sensor, availableModels, onClose, onSave, formError, setFormErrorExternally }) => {
    const [type, setType] = useState(sensor?.type || 'temperature');
    const [model, setModel] = useState(sensor?.model || '');
    const [unit, setUnit] = useState(sensor?.unit || (type === 'temperature' ? '°C' : '%'));
    const [status, setStatus] = useState(sensor?.status || 'active');

    const sensorTypes = ['temperature', 'humidity', 'light', 'soil_moisture', 'nutrient_level'];

    useEffect(() => {
        if (!sensor) {
            switch (type) {
                case 'temperature': setUnit('°C'); break;
                case 'humidity': setUnit('%'); break;
                case 'light': setUnit('lux'); break;
                case 'soil_moisture': setUnit('%'); break;
                case 'nutrient_level': setUnit('ppm'); break;
                default: setUnit('');
            }
        }
    }, [type, sensor]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormErrorExternally('');
        if (!type || !model || !unit) {
            setFormErrorExternally('Тип, модель та одиниця виміру є обов\'язковими для сенсора.');
            return;
        }
        if ((!sensor || sensor.model !== model) && availableModels.includes(model)) {
            setFormErrorExternally(`Сенсор з моделлю '${model}' вже існує для цієї теплиці.`);
            return;
        }
        onSave({ _id: sensor?._id, greenhouseId, type, model, unit, status });
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <h3>{sensor ? 'Редагувати Датчик' : 'Додати Новий Датчик'}</h3>
                {formError && <p className={styles.error}>{formError}</p>}
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="sensorType">Тип:</label>
                        <select id="sensorType" value={type} onChange={(e) => setType(e.target.value)} required>
                            {sensorTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="sensorModel">Модель (унікальний ID для ESP32):</label>
                        <input id="sensorModel" type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Напр. HWID_TEMP, HWID_SOIL" required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="sensorUnit">Одиниця виміру:</label>
                        <input id="sensorUnit" type="text" value={unit} onChange={(e) => setUnit(e.target.value)} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="sensorStatus">Статус:</label>
                        <select id="sensorStatus" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="active">Активний</option>
                            <option value="inactive">Неактивний</option>
                        </select>
                    </div>
                    <div className={styles.modalActions}>
                        <button type="submit" className={`${styles.actionButton} ${styles.saveButton}`}>Зберегти</button>
                        <button type="button" onClick={onClose} className={`${styles.actionButton} ${styles.cancelButton}`}>Скасувати</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const RuleFormModal = ({ greenhouseId, rule, sensorsInGreenhouse, onClose, onSave, formError, setFormErrorExternally }) => {
    const [sensorModelId, setSensorModelId] = useState(rule?.threshold?.sensorModelId || (sensorsInGreenhouse.length > 0 ? sensorsInGreenhouse[0].model : ''));
    const [operator, setOperator] = useState(rule?.threshold?.operator || '>');
    const [value, setValue] = useState(rule?.threshold?.value !== undefined ? rule.threshold.value : '');
    const [action, setAction] = useState(rule?.action || '');
    const [status, setStatus] = useState(rule?.status || 'active');

    const operators = ['>', '<', '>=', '<='];
    const actions = ['START_COOLING', 'STOP_COOLING', 'START_HEATING', 'STOP_HEATING', 'START_VENTILATION', 'STOP_VENTILATION', 'START_HUMIDIFYING', 'STOP_HUMIDIFYING', 'TURN_ON_LIGHT', 'TURN_OFF_LIGHT', 'START_WATERING', 'STOP_WATERING'];

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormErrorExternally('');
        if (!sensorModelId || !operator || value === '' || !action) {
            setFormErrorExternally('Усі поля правила є обов\'язковими.');
            return;
        }
        onSave({
            _id: rule?._id,
            greenhouseId,
            condition: 'sensor_based',
            threshold: { sensorModelId, operator, value: parseFloat(value) },
            action,
            status
        });
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <h3>{rule ? 'Редагувати Правило' : 'Додати Нове Правило'}</h3>
                {formError && <p className={styles.error}>{formError}</p>}
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="ruleSensorModel">Якщо датчик (модель):</label>
                        <select id="ruleSensorModel" value={sensorModelId} onChange={(e) => setSensorModelId(e.target.value)} required>
                            <option value="">Оберіть датчик</option>
                            {sensorsInGreenhouse.map(s => <option key={s._id} value={s.model}>{s.type} ({s.model})</option>)}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="ruleOperator">Оператор:</label>
                        <select id="ruleOperator" value={operator} onChange={(e) => setOperator(e.target.value)} required>
                            {operators.map(op => <option key={op} value={op}>{op}</option>)}
                        </select>
                    </div>
                     <div className={styles.formGroup}>
                        <label htmlFor="ruleValue">Значення:</label>
                        <input id="ruleValue" type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="ruleAction">Дія:</label>
                        <select id="ruleAction" value={action} onChange={(e) => setAction(e.target.value)} required>
                             <option value="">Оберіть дію</option>
                            {actions.map(act => <option key={act} value={act}>{act}</option>)}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="ruleStatus">Статус:</label>
                        <select id="ruleStatus" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="active">Активне</option>
                            <option value="inactive">Неактивне</option>
                        </select>
                    </div>
                    <div className={styles.modalActions}>
                        <button type="submit" className={`${styles.actionButton} ${styles.saveButton}`}>Зберегти</button>
                        <button type="button" onClick={onClose} className={`${styles.actionButton} ${styles.cancelButton}`}>Скасувати</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminGreenhouseDetailPage = () => {
    const { greenhouseId } = useParams();
    const navigate = useNavigate();
    const [greenhouse, setGreenhouse] = useState(null);
    const [sensors, setSensors] = useState([]);
    const [rules, setRules] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalError, setModalError] = useState('');

    const [showSensorModal, setShowSensorModal] = useState(false);
    const [editingSensor, setEditingSensor] = useState(null);
    const [showRuleModal, setShowRuleModal] = useState(false);
    const [editingRule, setEditingRule] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const ghDataPromise = adminService.getGreenhouseByIdAdmin(greenhouseId);
            const sensorsDataPromise = adminService.getSensorsForGreenhouseAdmin(greenhouseId);
            const rulesDataPromise = adminService.getRulesForGreenhouseAdmin(greenhouseId);
            const logsDataPromise = adminService.getLogsForGreenhouseAdmin(greenhouseId, { limit: 20 });

            const [ghData, sensorsData, rulesData, logsData] = await Promise.all([
                ghDataPromise, sensorsDataPromise, rulesDataPromise, logsDataPromise
            ]);

            setGreenhouse(ghData);
            setSensors(sensorsData);
            setRules(rulesData);
            setLogs(logsData);
        } catch (err) {
            setError(err.response?.data?.message || err.message || `Не вдалося завантажити дані для теплиці ${greenhouseId}.`);
            setGreenhouse(null);
        }
        setLoading(false);
    }, [greenhouseId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleString('uk-UA');
    }

    const handleSaveSensor = async (sensorData) => {
        setModalError('');
        try {
            if (sensorData._id) {
                await adminService.updateSensorAdmin(sensorData._id, sensorData);
            } else {
                await adminService.createSensorAdmin(sensorData);
            }
            setShowSensorModal(false);
            setEditingSensor(null);
            fetchData();
        } catch (err) {
            setModalError(err.response?.data?.message || err.message || 'Не вдалося зберегти датчик.');
        }
    };
    const handleDeleteSensor = async (sensorId, sensorModel) => {
        if (window.confirm(`Ви впевнені, що хочете видалити датчик "${sensorModel}"? Всі його дані також будуть видалені.`)) {
            setError('');
            try {
                await adminService.deleteSensorAdmin(sensorId);
                fetchData();
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Не вдалося видалити датчик.');
            }
        }
    };

    const toggleSensorStatus = async (sensor) => {
        const newStatus = sensor.status === 'active' ? 'inactive' : 'active';
        try {
            await adminService.updateSensorAdmin(sensor._id, { ...sensor, status: newStatus });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || err.message || `Не вдалося змінити статус датчика ${sensor.model}.`);
        }
    };


    const handleSaveRule = async (ruleData) => {
        setModalError('');
        try {
            if (ruleData._id) {
                await adminService.updateRuleAdmin(ruleData._id, ruleData);
            } else {
                await adminService.createRuleAdmin(ruleData);
            }
            setShowRuleModal(false);
            setEditingRule(null);
            fetchData();
        } catch (err) {
            setModalError(err.response?.data?.message || err.message || 'Не вдалося зберегти правило.');
        }
    };
    const handleDeleteRule = async (ruleId) => {
        if (window.confirm(`Ви впевнені, що хочете видалити це правило?`)) {
            setError('');
            try {
                await adminService.deleteRuleAdmin(ruleId);
                fetchData();
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Не вдалося видалити правило.');
            }
        }
    };

    const toggleRuleStatus = async (rule) => {
        const newStatus = rule.status === 'active' ? 'inactive' : 'active';
        try {
            await adminService.updateRuleAdmin(rule._id, { ...rule, status: newStatus });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || err.message || `Не вдалося змінити статус правила.`);
        }
    };


    if (loading) return <div className={styles.detailPageContainer}><p>Завантаження деталей теплиці...</p></div>;
    if (error && !greenhouse) return <div className={styles.detailPageContainer}><p className={styles.error}>{error}</p><button onClick={() => navigate(-1)} className={styles.backButton}>Повернутися назад</button></div>;

    return (
        <div className={styles.detailPageContainer}>
            <button onClick={() => navigate(-1)} className={styles.backButton}>← Назад до списку теплиць</button>
            {greenhouse ? (
                <>
                    <div className={styles.headerActions}>
                        <h2>Деталі Теплиці: {greenhouse.name}</h2>
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <div className={styles.ghInfo}>
                        <p><strong>ID:</strong> {greenhouse._id}</p>
                        <p><strong>Розташування:</strong> {greenhouse.location || '-'}</p>
                        <p><strong>Hardware ID Контролера:</strong> {greenhouse.hardwareId || 'Не встановлено'}</p>
                        <p><strong>Власник:</strong> {greenhouse.ownerId?.username || 'N/A'}</p>
                        <p><strong>Створено:</strong> {formatTimestamp(greenhouse.createdAt)}</p>
                    </div>

                    <div className={styles.sectionsContainer}>
                        <section className={styles.dataSection}>
                            <div className={styles.sectionHeader}>
                                <h3>Датчики ({sensors.length})</h3>
                                <button onClick={() => { setEditingSensor(null); setShowSensorModal(true); setModalError(''); }} className={styles.addButtonSmall}>+ Датчик</button>
                            </div>
                            {sensors.length > 0 ? (
                                <ul className={styles.itemList}>
                                    {sensors.map(s => (
                                        <li key={s._id} className={styles.sensorItem}>
                                            <div>
                                                <span className={styles.sensorType}>{s.type}</span> ({s.model})
                                                {s.isDefault && <span className={styles.defaultBadge}>Стандартний</span>}
                                                <br/>
                                                <span className={styles.sensorValue}>{s.lastValue !== undefined ? `${s.lastValue} ${s.unit}` : 'Немає даних'}</span>
                                                <small className={styles.sensorTimestamp}>Оновлено: {s.lastUpdated ? formatTimestamp(s.lastUpdated) : '-'}</small>
                                            </div>
                                            <div className={styles.itemActions}>
                                                <span 
                                                    className={`${styles.statusBadge} ${s.status === 'active' ? styles.activeBadge : styles.inactiveBadge} ${styles.clickableBadge}`}
                                                    onClick={() => toggleSensorStatus(s)}
                                                    title="Змінити статус"
                                                >
                                                    {s.status === 'active' ? 'Активний' : 'Неактивний'}
                                                </span>
                                                <button onClick={() => { setEditingSensor(s); setShowSensorModal(true); setModalError('');}} className={`${styles.actionButtonSmall} ${styles.editButton}`}>Р</button>
                                                <button onClick={() => handleDeleteSensor(s._id, s.model)} className={`${styles.actionButtonSmall} ${styles.deleteButton}`} disabled={s.isDefault}>В</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p>Датчики не налаштовані або немає даних.</p>}
                        </section>

                        <section className={styles.dataSection}>
                             <div className={styles.sectionHeader}>
                                <h3>Правила ({rules.length})</h3>
                                <button onClick={() => { setEditingRule(null); setShowRuleModal(true); setModalError(''); }} className={styles.addButtonSmall}>+ Правило</button>
                            </div>
                            {rules.length > 0 ? (
                                <ul className={styles.itemList}>
                                    {rules.map(r => (
                                        <li key={r._id} className={`${styles.ruleItem}`}>
                                            <div>
                                                Якщо <strong>{r.threshold.sensorModelId}</strong> {r.threshold.operator} {r.threshold.value} → <strong>{r.action}</strong>
                                            </div>
                                            <div className={styles.itemActions}>
                                                <span 
                                                    className={`${styles.statusBadge} ${r.status === 'active' ? styles.activeBadge : styles.inactiveBadge} ${styles.clickableBadge}`}
                                                    onClick={() => toggleRuleStatus(r)}
                                                    title="Змінити статус"
                                                >
                                                    {r.status === 'active' ? 'Активне' : 'Неактивне'}
                                                </span>
                                                <button onClick={() => { setEditingRule(r); setShowRuleModal(true); setModalError('');}} className={`${styles.actionButtonSmall} ${styles.editButton}`}>Р</button>
                                                <button onClick={() => handleDeleteRule(r._id)} className={`${styles.actionButtonSmall} ${styles.deleteButton}`}>В</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p>Правила не налаштовані.</p>}
                        </section>

                        <section className={styles.dataSection}>
                            <h3>Останні Події (Логи) ({logs.length})</h3>
                             {logs.length > 0 ? (
                                <ul className={styles.itemList}>
                                    {logs.map(l => (
                                        <li key={l._id} className={`${styles.logItem} ${styles['log-' + l.type]}`}>
                                           <span className={styles.logTimestamp}>[{formatTimestamp(l.timestamp)}]</span>
                                           <span className={`${styles.logTypeBadge} ${styles['badge' + l.type.charAt(0).toUpperCase() + l.type.slice(1)]}`}>{l.type.toUpperCase()}</span>:
                                           <span className={styles.logMessage}>{l.message}</span>
                                           {l.userId?.username && <small className={styles.logUser}> (Користувач: {l.userId.username})</small>}
                                        </li>
                                    ))}
                                </ul>
                            ) : <p>Немає доступних логів.</p>}
                        </section>
                    </div>
                </>
            ) : (
                !loading && <p>Теплицю не знайдено.</p> 
            )}

            {showSensorModal && greenhouse && (
                <SensorFormModal
                    greenhouseId={greenhouse._id}
                    sensor={editingSensor}
                    availableModels={sensors.map(s=>s.model)}
                    onClose={() => { setShowSensorModal(false); setEditingSensor(null); setModalError('');}}
                    onSave={handleSaveSensor}
                    formError={modalError}
                    setFormErrorExternally={setModalError}
                />
            )}

            {showRuleModal && greenhouse && (
                <RuleFormModal
                    greenhouseId={greenhouse._id}
                    rule={editingRule}
                    sensorsInGreenhouse={sensors}
                    onClose={() => { setShowRuleModal(false); setEditingRule(null); setModalError(''); }}
                    onSave={handleSaveRule}
                    formError={modalError}
                    setFormErrorExternally={setModalError}
                />
            )}
        </div>
    );
};

export default AdminGreenhouseDetailPage;