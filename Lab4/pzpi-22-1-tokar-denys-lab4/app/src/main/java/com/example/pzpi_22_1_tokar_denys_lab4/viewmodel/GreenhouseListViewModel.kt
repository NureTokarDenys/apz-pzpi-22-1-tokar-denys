package com.example.pzpi_22_1_tokar_denys_lab4.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.pzpi_22_1_tokar_denys_lab4.data.model.Greenhouse
import com.example.pzpi_22_1_tokar_denys_lab4.data.repository.GreenhouseRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class GreenhouseListState {
    object Idle : GreenhouseListState()
    object Loading : GreenhouseListState()
    data class Success(val greenhouses: List<Greenhouse>) : GreenhouseListState()
    data class Error(val message: String) : GreenhouseListState()
}

class GreenhouseListViewModel(
    private val greenhouseRepository: GreenhouseRepository = GreenhouseRepository()
) : ViewModel() {

    private val _greenhouseListState = MutableStateFlow<GreenhouseListState>(GreenhouseListState.Idle)
    val greenhouseListState: StateFlow<GreenhouseListState> = _greenhouseListState.asStateFlow()

    fun fetchGreenhouses(token: String) {
        viewModelScope.launch {
            _greenhouseListState.value = GreenhouseListState.Loading
            val result = greenhouseRepository.getGreenhouses(token)
            result.fold(
                onSuccess = { greenhouses ->
                    _greenhouseListState.value = GreenhouseListState.Success(greenhouses)
                },
                onFailure = { exception ->
                    _greenhouseListState.value = GreenhouseListState.Error(exception.message ?: "Failed to load greenhouses")
                }
            )
        }
    }
}