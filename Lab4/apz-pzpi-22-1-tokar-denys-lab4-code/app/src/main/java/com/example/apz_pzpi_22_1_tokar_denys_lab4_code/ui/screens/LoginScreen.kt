package com.example.apz_pzpi_22_1_tokar_denys_lab4_code.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.viewmodel.LoginUiState
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.viewmodel.LoginViewModel
import kotlinx.coroutines.flow.collectLatest

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(navController: NavController, loginViewModel: LoginViewModel = viewModel()) {
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val loginState by loginViewModel.loginUiState.collectAsState() // Використовуйте collectAsStateWithLifecycle для кращої роботи з життєвим циклом
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(loginState) {
        when (val state = loginState) {
            is LoginUiState.Loading -> isLoading = true
            is LoginUiState.Success -> {
                isLoading = false
                // TODO: Зберегти токен та дані користувача
                // Перехід на головний екран/дашборд
                navController.navigate("dashboard") { // Або інший роут
                    popUpTo("login") { inclusive = true } // Видаляємо екран логіну зі стеку
                }
                loginViewModel.resetState() // Скидаємо стан після успіху
            }
            is LoginUiState.Error -> {
                isLoading = false
                errorMessage = state.message
            }
            LoginUiState.Idle -> isLoading = false
        }
    }


    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Login") })
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("Greenhouse Control", style = MaterialTheme.typography.headlineMedium)
            Spacer(modifier = Modifier.height(32.dp))

            OutlinedTextField(
                value = username,
                onValueChange = { username = it },
                label = { Text("Username") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Password") },
                modifier = Modifier.fillMaxWidth(),
                visualTransformation = PasswordVisualTransformation(),
                singleLine = true
            )
            Spacer(modifier = Modifier.height(24.dp))

            if (isLoading) {
                CircularProgressIndicator()
            } else {
                Button(
                    onClick = {
                        errorMessage = null // Скидаємо помилку перед новим запитом
                        loginViewModel.login(username, password)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = username.isNotBlank() && password.isNotBlank()
                ) {
                    Text("Login")
                }
            }

            errorMessage?.let {
                Spacer(modifier = Modifier.height(16.dp))
                Text(it, color = MaterialTheme.colorScheme.error)
            }

            Spacer(modifier = Modifier.height(16.dp))
            TextButton(onClick = { navController.navigate("register") }) {
                Text("Don't have an account? Register")
            }
        }
    }
}