package com.example.apz_pzpi_22_1_tokar_denys_lab4_code.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.model.Rule
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.model.SensorValue
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.viewmodel.GreenhouseDetailState
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.viewmodel.GreenhouseDetailViewModel

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
    var showRuleDialog by remember { mutableStateOf(false) }
    var selectedRuleToEdit by remember { mutableStateOf<Rule?>(null) }

    LaunchedEffect(greenhouseId) {
        val token = "Bearer YOUR_SAVED_TOKEN" // Replace with actual token retrieval
        detailViewModel.fetchGreenhouseDetails(token)
    }

    val appBarTitle = when (val state = detailState) {
        is GreenhouseDetailState.Success -> state.greenhouse?.name ?: "Greenhouse Details"
        is GreenhouseDetailState.Error -> "Error"
        else -> "Loading..."
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(appBarTitle) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Filled.ArrowBack, "Back")
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
                    val greenhouse = state.greenhouse
                    val currentData = state.currentSensorData
                    val rules = state.rules

                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        item {
                            Text(greenhouse?.name ?: "Unknown Greenhouse", style = MaterialTheme.typography.headlineSmall)
                            greenhouse?.location?.let { Text("Location: $it") }
                        }

                        item { Text("Current Sensor Data:", style = MaterialTheme.typography.titleMedium) }
                        if (currentData.isEmpty()) {
                            item { Text("No current sensor data available.") }
                        } else {
                            items(currentData) { sensorValue ->
                                SensorDataItem(sensorValue)
                            }
                        }

                        item { Text("Automation Rules:", style = MaterialTheme.typography.titleMedium) }
                        if (rules.isEmpty()) {
                            item { Text("No rules configured.") }
                        } else {
                            items(rules) { rule ->
                                RuleItem(
                                    rule = rule,
                                    onStatusChange = { newStatus ->
                                        detailViewModel.updateRuleStatus("Bearer YOUR_TOKEN", rule._id, newStatus)
                                    },
                                    onEditClick = {
                                        selectedRuleToEdit = rule
                                        showRuleDialog = true
                                    }
                                )
                            }
                        }
                    }
                }
                is GreenhouseDetailState.Error -> {
                    Text(
                        "Error: ${state.message}",
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(16.dp)
                    )
                }
                GreenhouseDetailState.Idle -> {
                    // You can show an initial placeholder or nothing
                }
            }
        }
    }

    if (showRuleDialog && selectedRuleToEdit != null) {
        AlertDialog(
            onDismissRequest = { showRuleDialog = false },
            title = { Text("Edit Rule (Placeholder)") },
            text = { Text("Rule editing for '${selectedRuleToEdit!!.action}' is not yet implemented.") },
            confirmButton = { Button(onClick = { showRuleDialog = false }) { Text("OK") } }
        )
    }
}

@Composable
fun SensorDataItem(sensorValue: SensorValue) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(8.dp)) {
            Text(
                "${sensorValue.type} (${sensorValue.model}): ${sensorValue.value ?: "N/A"} ${sensorValue.unit}",
                style = MaterialTheme.typography.bodyLarge
            )
            sensorValue.lastUpdated?.let { Text("Last updated: $it", style = MaterialTheme.typography.bodySmall) }
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
                Text("Action: ${rule.action}", style = MaterialTheme.typography.titleSmall)
                Text("Condition: ${rule.threshold.sensorModelId} ${rule.threshold.operator} ${rule.threshold.value}", style = MaterialTheme.typography.bodyMedium)
            }
            Switch(
                checked = rule.status == "active",
                onCheckedChange = { isChecked ->
                    onStatusChange(if (isChecked) "active" else "inactive")
                }
            )
            IconButton(onClick = onEditClick) {
                Icon(Icons.Filled.Edit, contentDescription = "Edit Rule")
            }
        }
    }
}