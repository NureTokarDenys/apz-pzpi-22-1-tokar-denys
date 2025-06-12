import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import greenhouseService from '../../../services/greenhouseService';
import styles from './UserGreenhouseDetailPage.module.css'; // Можна використовувати той самий CSS, що й для AdminGreenhouseDetailPage

// --- RuleFormModal (можна винести в окремий компонент, якщо використовується в кількох місцях) ---
const RuleFormModalUser = ({ greenhouseId, rule, sensorsInGreenhouse, onClose, onSave, formError, setFormErrorExternally }) => {
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
        const ruleToSave = {
            _id: rule?._id,
            greenhouseId,
            condition: 'sensor_based',
            threshold: { sensorModelId, operator, value: parseFloat(value) },
            action,
            status
        };
        onSave(ruleToSave);
    };
    
    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <h3>{rule ? 'Редагувати Правило' : 'Створити Нове Правило'}</h3>
                {formError && <p className={styles.error}>{formError}</p>}
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="userRuleSensorModel">Якщо датчик (модель):</label>
                        <select id="userRuleSensorModel" value={sensorModelId} onChange={(e) => setSensorModelId(e.target.value)} required>
                            <option value="">Оберіть датчик</option>
                            {sensorsInGreenhouse.map(s => <option key={s._id} value={s.model} disabled={s.status === 'inactive'}>{s.type} ({s.model}) {s.status === 'inactive' ? '- Неактивний' : ''}</option>)}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="userRuleOperator">Оператор:</label>
                        <select id="userRuleOperator" value={operator} onChange={(e) => setOperator(e.target.value)} required>
                            {operators.map(op => <option key={op} value={op}>{op}</option>)}
                        </select>
                    </div>
                     <div className={styles.formGroup}>
                        <label htmlFor="userRuleValue">Значення:</label>
                        <input id="userRuleValue" type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="userRuleAction">Дія:</label>
                        <select id="userRuleAction" value={action} onChange={(e) => setAction(e.target.value)} required>
                             <option value="">Оберіть дію</option>
                            {actions.map(act => <option key={act} value={act}>{act}</option>)}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="userRuleStatus">Статус:</label>
                        <select id="userRuleStatus" value={status} onChange={(e) => setStatus(e.target.value)}>
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


const UserGreenhouseDetailPage = () => {
    const { greenhouseId } = useParams();
    const navigate = useNavigate();
    const [greenhouse, setGreenhouse] = useState(null);
    const [sensors, setSensors] = useState([]);
    const [rules, setRules] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalError, setModalError] = useState('');

    const [showRuleModal, setShowRuleModal] = useState(false);
    const [editingRule, setEditingRule] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [ghData, sensorsData, rulesData, logsData] = await Promise.all([
                greenhouseService.getMyGreenhouseById(greenhouseId),
                greenhouseService.getSensorsForMyGreenhouse(greenhouseId),
                greenhouseService.getRulesForMyGreenhouse(greenhouseId),
                greenhouseService.getLogsForMyGreenhouse(greenhouseId, { limit: 20 })
            ]);
            setGreenhouse(ghData);
            setSensors(sensorsData);
            setRules(rulesData);
            setLogs(logsData);
        } catch (err) {
            setError(err.response?.data?.message || err.message || `Не вдалося завантажити дані для теплиці.`);
            if (err.response?.status === 403 || err.response?.status === 404) {
                 setGreenhouse(null);
            }
        }
        setLoading(false);
    }, [greenhouseId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleString('uk-UA');
    };

    const handleSaveRule = async (ruleData) => {
        setModalError('');
        try {
            if (ruleData._id) {
                await greenhouseService.updateMyRule(ruleData._id, ruleData);
            } else {
                await greenhouseService.createMyRule(ruleData);
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
                await greenhouseService.deleteMyRule(ruleId);
                fetchData();
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Не вдалося видалити правило.');
            }
        }
    };
    
    const toggleRuleStatus = async (rule) => { // Ця функція вже була, можна використовувати її
        const newStatus = rule.status === 'active' ? 'inactive' : 'active';
        try {
            await greenhouseService.updateMyRule(rule._id, { status: newStatus }); // Тільки статус
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || err.message || `Не вдалося змінити статус правила.`);
        }
    };


    if (loading) return <div className={styles.detailPageContainer}><p>Завантаження деталей вашої теплиці...</p></div>;
    if (error && !greenhouse) return <div className={styles.detailPageContainer}><p className={styles.error}>{error}</p><button onClick={() => navigate('/my-greenhouses')} className={styles.backButton}>До Моїх Теплиць</button></div>;
    if (!greenhouse) return <div className={styles.detailPageContainer}><p>Теплицю не знайдено або у вас немає доступу.</p><button onClick={() => navigate('/my-greenhouses')} className={styles.backButton}>До Моїх Теплиць</button></div>;

    return (
        <div className={styles.detailPageContainer}>
            <button onClick={() => navigate('/my-greenhouses')} className={styles.backButton}>← До Моїх Теплиць</button>
            <>
                <div className={styles.headerActions}>
                    <h2>Деталі Теплиці: {greenhouse.name}</h2>
                    <Link to={`/my-greenhouses/${greenhouseId}/statistics`} className={styles.actionButton}>
                            Переглянути Статистику даних
                    </Link>
                </div>
                {error && <p className={styles.error}>{error}</p>}
                <div className={styles.ghInfo}>
                    <p><strong>ID:</strong> {greenhouse._id}</p>
                    <p><strong>Розташування:</strong> {greenhouse.location || '-'}</p>
                    <p><strong>Hardware ID Контролера:</strong> {greenhouse.hardwareId || 'Не встановлено'}</p>
                    <p><strong>Створено:</strong> {formatTimestamp(greenhouse.createdAt)}</p>
                </div>

                <div className={styles.sectionsContainer}>
                    <section className={styles.dataSection}>
                        <h3>Датчики ({sensors.length})</h3>
                        {sensors.length > 0 ? (
                            <ul className={styles.itemList}>
                                {sensors.map(s => (
                                    <li key={s._id} className={styles.sensorItem}>
                                        <div>
                                            <span className={styles.sensorType}>{s.type}</span> ({s.model})
                                            {s.isDefault && <span className={styles.defaultBadge}>Стандартний</span>}
                                            <span className={`${styles.statusBadge} ${s.status === 'active' ? styles.activeBadge : styles.inactiveBadge}`}>
                                                {s.status === 'active' ? 'Активний' : 'Неактивний'}
                                            </span>
                                            <br/>
                                            <span className={styles.sensorValue}>{s.lastValue !== undefined ? `${s.lastValue} ${s.unit}` : 'Немає даних'}</span>
                                            <small className={styles.sensorTimestamp}>Оновлено: {s.lastUpdated ? formatTimestamp(s.lastUpdated) : '-'}</small>
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
                                    </li>
                                ))}
                            </ul>
                        ) : <p>Немає доступних логів.</p>}
                    </section>
                </div>
            </>
             {showRuleModal && greenhouse && sensors.length > 0 && (
                <RuleFormModalUser
                    greenhouseId={greenhouse._id}
                    rule={editingRule}
                    sensorsInGreenhouse={sensors.filter(s => s.status === 'active')} // Передаємо тільки активні датчики для вибору
                    onClose={() => { setShowRuleModal(false); setEditingRule(null); setModalError(''); }}
                    onSave={handleSaveRule}
                    formError={modalError}
                    setFormErrorExternally={setModalError}
                />
            )}
        </div>
    );
};

export default UserGreenhouseDetailPage;