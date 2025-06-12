package com.example.apz_pzpi_22_1_tokar_denys_lab4_code.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.model.AuthResponse
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

// Для представлення стану UI
sealed class LoginUiState {
    object Idle : LoginUiState()
    object Loading : LoginUiState()
    data class Success(val authResponse: AuthResponse) : LoginUiState()
    data class Error(val message: String) : LoginUiState()
}

class LoginViewModel(private val authRepository: AuthRepository = AuthRepository()) : ViewModel() {

    private val _loginUiState = MutableStateFlow<LoginUiState>(LoginUiState.Idle)
    val loginUiState: StateFlow<LoginUiState> = _loginUiState.asStateFlow()

    fun login(username: String, password: String) {
        viewModelScope.launch {
            _loginUiState.value = LoginUiState.Loading
            val result = authRepository.login(username, password)
            result.fold(
                onSuccess = { authResponse ->
                    // Тут можна зберегти токен (наприклад, в SharedPreferences або DataStore)
                    // Для простоти, поки що просто передаємо далі
                    _loginUiState.value = LoginUiState.Success(authResponse)
                },
                onFailure = { exception ->
                    _loginUiState.value = LoginUiState.Error(exception.message ?: "Unknown login error")
                }
            )
        }
    }

    fun resetState() {
        _loginUiState.value = LoginUiState.Idle
    }
}