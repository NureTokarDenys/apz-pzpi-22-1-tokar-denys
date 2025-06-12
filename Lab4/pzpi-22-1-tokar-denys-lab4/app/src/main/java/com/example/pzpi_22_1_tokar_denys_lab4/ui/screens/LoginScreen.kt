package com.example.pzpi_22_1_tokar_denys_lab4.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.pzpi_22_1_tokar_denys_lab4.viewmodel.LoginUiState
import com.example.pzpi_22_1_tokar_denys_lab4.viewmodel.LoginViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(navController: NavController, loginViewModel: LoginViewModel = viewModel()) {
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val loginState by loginViewModel.loginUiState.collectAsState()
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(loginState) {
        when (val state = loginState) {
            is LoginUiState.Loading -> isLoading = true
            is LoginUiState.Success -> {
                isLoading = false
                navController.navigate("dashboard") {
                    popUpTo("login") { inclusive = true }
                }
                loginViewModel.resetState()
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
            TopAppBar(title = { Text("Вхід") })
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
            Text("Керування Теплицею", style = MaterialTheme.typography.headlineMedium)
            Spacer(modifier = Modifier.height(32.dp))

            OutlinedTextField(
                value = username,
                onValueChange = { username = it },
                label = { Text("Ім'я користувача") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Пароль") },
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
                        errorMessage = null
                        loginViewModel.login(username, password)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = username.isNotBlank() && password.isNotBlank()
                ) {
                    Text("Увійти")
                }
            }

            errorMessage?.let {
                Spacer(modifier = Modifier.height(16.dp))
                // Повідомлення про помилку залишаємо англійською,
                // бо воно приходить з сервера, але можна додати свій обробник
                Text(it, color = MaterialTheme.colorScheme.error)
            }
        }
    }
}