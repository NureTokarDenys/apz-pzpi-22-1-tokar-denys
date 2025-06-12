package com.example.pzpi_22_1_tokar_denys_lab4.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.pzpi_22_1_tokar_denys_lab4.data.model.Rule
import com.example.pzpi_22_1_tokar_denys_lab4.data.model.Sensor
import com.example.pzpi_22_1_tokar_denys_lab4.data.model.Threshold
import com.example.pzpi_22_1_tokar_denys_lab4.viewmodel.GreenhouseDetailState
import com.example.pzpi_22_1_tokar_denys_lab4.viewmodel.GreenhouseDetailViewModel
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GreenhouseDetailScreen(
    navController: NavController,
    greenhouseId: String,
    detailViewModel: GreenhouseDetailViewModel = viewModel(
        factory = GreenhouseDetailViewModel.provideFactory(greenhouseId = greenhouseId)
    )
) {
    val detailState by detailViewModel.detailState.collectAsState()
    var showEditRuleDialog by remember { mutableStateOf(false) }
    var selectedRuleToEdit by remember { mutableStateOf<Rule?>(null) }

    LaunchedEffect(greenhouseId) {
        detailViewModel.fetchGreenhouseDetails()
    }

    val appBarTitle = when (val state = detailState) {
        is GreenhouseDetailState.Success -> state.greenhouse?.name ?: "Деталі Теплиці"
        is GreenhouseDetailState.Error -> "Помилка"
        else -> "Завантаження..."
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(appBarTitle) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Filled.ArrowBack, "Назад")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (val state = detailState) {
                is GreenhouseDetailState.Loading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                }
                is GreenhouseDetailState.Success -> {
                    val sensors = state.sensors
                    val rules = state.rules

                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        item {
                            Text(state.greenhouse?.name ?: "Невідома Теплиця", style = MaterialTheme.typography.headlineSmall)
                            state.greenhouse?.location?.let { Text("Розташування: $it") }
                        }

                        item { Text("Поточні дані з датчиків:", style = MaterialTheme.typography.titleMedium) }
                        if (sensors.isEmpty()) {
                            item { Text("Датчики в цій теплиці не знайдені.") }
                        } else {
                            items(sensors) { sensor ->
                                SensorDataItem(
                                    sensor = sensor,
                                    onClick = {
                                        val encodedUnit = URLEncoder.encode(sensor.unit, StandardCharsets.UTF_8.toString())
                                        navController.navigate("sensorHistory/${sensor._id}/${sensor.type}/${sensor.model}/$encodedUnit")
                                    }
                                )
                            }
                        }

                        item { Text("Правила автоматизації:", style = MaterialTheme.typography.titleMedium) }
                        if (rules.isEmpty()) {
                            item { Text("Правила не налаштовані.") }
                        } else {
                            items(rules) { rule ->
                                RuleItem(
                                    rule = rule,
                                    onStatusChange = { newStatus ->
                                        detailViewModel.updateRuleStatus(rule._id, newStatus)
                                    },
                                    onEditClick = {
                                        selectedRuleToEdit = rule
                                        showEditRuleDialog = true
                                    }
                                )
                            }
                        }
                    }

                    if (showEditRuleDialog && selectedRuleToEdit != null) {
                        EditRuleDialog(
                            rule = selectedRuleToEdit!!,
                            sensors = sensors,
                            onDismiss = { showEditRuleDialog = false },
                            onSave = { updatedRule ->
                                detailViewModel.updateRule(updatedRule)
                                showEditRuleDialog = false
                            }
                        )
                    }
                }
                is GreenhouseDetailState.Error -> {
                    Text(
                        "Помилка: ${state.message}",
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(16.dp)
                    )
                }
                GreenhouseDetailState.Idle -> { }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SensorDataItem(sensor: Sensor, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(Modifier.padding(16.dp)) {
            Text(
                "${sensor.type} (${sensor.model}): ${sensor.lastValue ?: "Немає даних"} ${sensor.unit}",
                style = MaterialTheme.typography.bodyLarge
            )
            sensor.lastUpdated?.let { Text("Останнє оновлення: $it", style = MaterialTheme.typography.bodySmall) }
        }
    }
}

@Composable
fun RuleItem(rule: Rule, onStatusChange: (String) -> Unit, onEditClick: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .padding(8.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text("Дія: ${rule.action}", style = MaterialTheme.typography.titleSmall)
                Text("Умова: ${rule.threshold.sensorModelId} ${rule.threshold.operator} ${rule.threshold.value}", style = MaterialTheme.typography.bodyMedium)
            }
            Switch(
                checked = rule.status == "active",
                onCheckedChange = { isChecked ->
                    onStatusChange(if (isChecked) "active" else "inactive")
                }
            )
            IconButton(onClick = onEditClick) {
                Icon(Icons.Filled.Edit, contentDescription = "Редагувати Правило")
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditRuleDialog(
    rule: Rule,
    sensors: List<Sensor>,
    onDismiss: () -> Unit,
    onSave: (Rule) -> Unit
) {
    val actionMap = mapOf(
        "turn_on_light" to "Увімкнути світло",
        "turn_off_light" to "Вимкнути світло",
        "turn_on_fan" to "Увімкнути вентилятор",
        "turn_off_fan" to "Вимкнути вентилятор",
        "turn_on_watering" to "Увімкнути полив",
        "turn_off_watering" to "Вимкнути полив"
    )
    val operatorMap = mapOf(
        ">" to "Більше (>)",
        "<" to "Менше (<)",
        "==" to "Дорівнює (==)"
    )

    var selectedAction by remember { mutableStateOf(rule.action) }
    var selectedSensorModel by remember { mutableStateOf(rule.threshold.sensorModelId) }
    var selectedOperator by remember { mutableStateOf(rule.threshold.operator) }
    var thresholdValue by remember { mutableStateOf(rule.threshold.value.toString()) }

    var isActionExpanded by remember { mutableStateOf(false) }
    var isSensorExpanded by remember { mutableStateOf(false) }
    var isOperatorExpanded by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Редагувати правило") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                ExposedDropdownMenuBox(expanded = isActionExpanded, onExpandedChange = { isActionExpanded = it }) {
                    OutlinedTextField(
                        value = actionMap[selectedAction] ?: selectedAction,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Дія") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isActionExpanded) },
                        modifier = Modifier.menuAnchor().fillMaxWidth()
                    )
                    ExposedDropdownMenu(expanded = isActionExpanded, onDismissRequest = { isActionExpanded = false }) {
                        actionMap.forEach { (key, value) ->
                            DropdownMenuItem(text = { Text(value) }, onClick = {
                                selectedAction = key
                                isActionExpanded = false
                            })
                        }
                    }
                }

                ExposedDropdownMenuBox(expanded = isSensorExpanded, onExpandedChange = { isSensorExpanded = it }) {
                    OutlinedTextField(
                        value = selectedSensorModel,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Датчик (Модель)") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isSensorExpanded) },
                        modifier = Modifier.menuAnchor().fillMaxWidth()
                    )
                    ExposedDropdownMenu(expanded = isSensorExpanded, onDismissRequest = { isSensorExpanded = false }) {
                        sensors.forEach { sensor ->
                            DropdownMenuItem(text = { Text("${sensor.type} (${sensor.model})") }, onClick = {
                                selectedSensorModel = sensor.model
                                isSensorExpanded = false
                            })
                        }
                    }
                }

                ExposedDropdownMenuBox(expanded = isOperatorExpanded, onExpandedChange = { isOperatorExpanded = it }) {
                    OutlinedTextField(
                        value = operatorMap[selectedOperator] ?: selectedOperator,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Оператор") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isOperatorExpanded) },
                        modifier = Modifier.menuAnchor().fillMaxWidth()
                    )
                    ExposedDropdownMenu(expanded = isOperatorExpanded, onDismissRequest = { isOperatorExpanded = false }) {
                        operatorMap.forEach { (key, value) ->
                            DropdownMenuItem(text = { Text(value) }, onClick = {
                                selectedOperator = key
                                isOperatorExpanded = false
                            })
                        }
                    }
                }

                OutlinedTextField(
                    value = thresholdValue,
                    onValueChange = { thresholdValue = it },
                    label = { Text("Значення") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val updatedThreshold = Threshold(
                        sensorModelId = selectedSensorModel,
                        operator = selectedOperator,
                        value = thresholdValue.toDoubleOrNull() ?: rule.threshold.value
                    )
                    val updatedRule = rule.copy(
                        action = selectedAction,
                        threshold = updatedThreshold
                    )
                    onSave(updatedRule)
                },
                enabled = thresholdValue.toDoubleOrNull() != null
            ) {
                Text("Зберегти")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Скасувати")
            }
        }
    )
}