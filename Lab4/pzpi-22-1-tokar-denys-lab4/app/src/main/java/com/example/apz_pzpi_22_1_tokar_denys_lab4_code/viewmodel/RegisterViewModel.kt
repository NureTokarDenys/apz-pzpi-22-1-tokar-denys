package com.example.apz_pzpi_22_1_tokar_denys_lab4_code.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.model.AuthResponse
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class RegisterUiState {
    object Idle : RegisterUiState()
    object Loading : RegisterUiState()
    data class Success(val authResponse: AuthResponse) : RegisterUiState()
    data class Error(val message: String) : RegisterUiState()
}

class RegisterViewModel(private val authRepository: AuthRepository = AuthRepository()) : ViewModel() {

    private val _registerUiState = MutableStateFlow<RegisterUiState>(RegisterUiState.Idle)
    val registerUiState: StateFlow<RegisterUiState> = _registerUiState.asStateFlow()

    fun register(username: String, email: String, password: String) {
        viewModelScope.launch {
            _registerUiState.value = RegisterUiState.Loading
            val result = authRepository.register(username, email, password)
            result.fold(
                onSuccess = { authResponse ->
                    // Тут можна зберегти токен (наприклад, в SharedPreferences або DataStore)
                    _registerUiState.value = RegisterUiState.Success(authResponse)
                },
                onFailure = { exception ->
                    _registerUiState.value = RegisterUiState.Error(exception.message ?: "Unknown registration error")
                }
            )
        }
    }
    fun resetState() {
        _registerUiState.value = RegisterUiState.Idle
    }
}