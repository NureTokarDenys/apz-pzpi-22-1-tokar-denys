package com.example.pzpi_22_1_tokar_denys_lab4.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.pzpi_22_1_tokar_denys_lab4.data.model.SensorData
import com.example.pzpi_22_1_tokar_denys_lab4.viewmodel.SensorHistoryState
import com.example.pzpi_22_1_tokar_denys_lab4.viewmodel.SensorHistoryViewModel
import java.net.URLDecoder
import java.nio.charset.StandardCharsets

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SensorHistoryScreen(
    navController: NavController,
    sensorId: String,
    sensorType: String,
    sensorModel: String,
    sensorUnit: String
) {
    val decodedUnit = remember(sensorUnit) {
        try {
            URLDecoder.decode(sensorUnit, StandardCharsets.UTF_8.toString())
        } catch (e: Exception) {
            sensorUnit
        }
    }

    val viewModel: SensorHistoryViewModel = viewModel(
        factory = SensorHistoryViewModel.provideFactory(sensorId = sensorId)
    )
    val state by viewModel.historyState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Історія: $sensorType ($sensorModel)") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Назад")
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
            when (val currentState = state) {
                is SensorHistoryState.Loading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                }
                is SensorHistoryState.Success -> {
                    if (currentState.data.isEmpty()) {
                        Text(
                            text = "Для цього датчика ще немає даних.",
                            modifier = Modifier.align(Alignment.Center),
                            textAlign = TextAlign.Center
                        )
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(16.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            items(currentState.data) { dataItem ->
                                SensorHistoryItem(data = dataItem, unit = decodedUnit)
                            }
                        }
                    }
                }
                is SensorHistoryState.Error -> {
                    Text(
                        text = "Помилка: ${currentState.message}",
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(16.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun SensorHistoryItem(data: SensorData, unit: String) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = data.formattedTimestamp,
                style = MaterialTheme.typography.bodyMedium
            )
            Text(
                text = "${data.value} $unit",
                style = MaterialTheme.typography.bodyLarge
            )
        }
    }
}