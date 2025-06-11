package com.example.apz_pzpi_22_1_tokar_denys_lab4_code.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.model.Greenhouse
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.viewmodel.GreenhouseListState
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.viewmodel.GreenhouseListViewModel // Створіть цей ViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    navController: NavController,
    greenhouseListViewModel: GreenhouseListViewModel = viewModel()
    // TODO: Передати функцію для виходу з системи
) {
    val greenhouseListState by greenhouseListViewModel.greenhouseListState.collectAsState()

    LaunchedEffect(Unit) { // Завантажити дані при першому запуску екрану
        // TODO: Отримати токен для запиту
        val token = "Bearer YOUR_SAVED_TOKEN" // Замініть на реальний токен
        greenhouseListViewModel.fetchGreenhouses(token)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Greenhouses") },
                actions = {
                    // Кнопка виходу, якщо потрібно
                    // IconButton(onClick = { /* TODO: logout action */ }) {
                    //     Icon(Icons.Filled.Logout, contentDescription = "Logout")
                    // }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = {
                // TODO: Перехід на екран створення нової теплиці (якщо це є в моб. додатку)
                // Або ця кнопка не потрібна, якщо створення лише через веб
            }) {
                Icon(Icons.Filled.Add, contentDescription = "Add Greenhouse")
            }
        }
    ) { paddingValues ->
        Box(modifier = Modifier
            .fillMaxSize()
            .padding(paddingValues)) {
            when (val state = greenhouseListState) {
                is GreenhouseListState.Loading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                }
                is GreenhouseListState.Success -> {
                    if (state.greenhouses.isEmpty()) {
                        Text(
                            "No greenhouses found. Add one via the web portal.",
                            modifier = Modifier.align(Alignment.Center).padding(16.dp)
                        )
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(16.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            items(state.greenhouses) { greenhouse ->
                                GreenhouseItem(greenhouse = greenhouse) {
                                    navController.navigate("greenhouseDetail/${greenhouse._id}")
                                }
                            }
                        }
                    }
                }
                is GreenhouseListState.Error -> {
                    Text(
                        "Error: ${state.message}",
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.align(Alignment.Center).padding(16.dp)
                    )
                }
                GreenhouseListState.Idle -> {
                    // Можна показати індикатор завантаження або нічого
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GreenhouseItem(greenhouse: Greenhouse, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = greenhouse.name, style = MaterialTheme.typography.titleMedium)
            greenhouse.location?.let {
                Text(text = it, style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}