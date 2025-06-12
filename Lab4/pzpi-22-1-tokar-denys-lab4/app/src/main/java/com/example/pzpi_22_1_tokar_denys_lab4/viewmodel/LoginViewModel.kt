package com.example.pzpi_22_1_tokar_denys_lab4.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.pzpi_22_1_tokar_denys_lab4.data.local.SessionManager
import com.example.pzpi_22_1_tokar_denys_lab4.data.model.AuthResponse
import com.example.pzpi_22_1_tokar_denys_lab4.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class LoginUiState {
    object Idle : LoginUiState()
    object Loading : LoginUiState()
    data class Success(val authResponse: AuthResponse) : LoginUiState()
    data class Error(val message: String) : LoginUiState()
}

class LoginViewModel(application: Application) : AndroidViewModel(application) {
    private val authRepository: AuthRepository = AuthRepository()
    private val sessionManager: SessionManager = SessionManager(application)

    private val _loginUiState = MutableStateFlow<LoginUiState>(LoginUiState.Idle)
    val loginUiState: StateFlow<LoginUiState> = _loginUiState.asStateFlow()

    fun login(username: String, password: String) {
        viewModelScope.launch {
            _loginUiState.value = LoginUiState.Loading
            val result = authRepository.login(username, password)
            result.fold(
                onSuccess = { authResponse ->
                    sessionManager.saveAuthToken(authResponse.token)
                    sessionManager.saveUserDetails(authResponse)
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