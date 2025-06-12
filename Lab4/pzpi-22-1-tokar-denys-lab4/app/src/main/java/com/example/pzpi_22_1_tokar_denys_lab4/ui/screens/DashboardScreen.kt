package com.example.pzpi_22_1_tokar_denys_lab4.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.pzpi_22_1_tokar_denys_lab4.data.model.Greenhouse
import com.example.pzpi_22_1_tokar_denys_lab4.viewmodel.GreenhouseListState
import com.example.pzpi_22_1_tokar_denys_lab4.viewmodel.GreenhouseListViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    navController: NavController,
    greenhouseListViewModel: GreenhouseListViewModel = viewModel()
) {
    val greenhouseListState by greenhouseListViewModel.greenhouseListState.collectAsState()

    LaunchedEffect(Unit) {
        greenhouseListViewModel.fetchGreenhouses()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Мої Теплиці") },
                actions = {
                    IconButton(onClick = {
                        greenhouseListViewModel.logout()
                        navController.navigate("login") {
                            popUpTo("dashboard") { inclusive = true }
                        }
                    }) {
                        Icon(Icons.Filled.Logout, contentDescription = "Вийти")
                    }
                }
            )
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
                            "Теплиць не знайдено. Додайте нову через веб-портал.",
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
                        "Помилка: ${state.message}",
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.align(Alignment.Center).padding(16.dp)
                    )
                }
                GreenhouseListState.Idle -> { }
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
                Text(text = "Розташування: $it", style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}