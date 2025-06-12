package com.example.pzpi_22_1_tokar_denys_lab4.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.pzpi_22_1_tokar_denys_lab4.data.model.SensorData
import com.example.pzpi_22_1_tokar_denys_lab4.data.repository.GreenhouseRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class SensorHistoryState {
    object Loading : SensorHistoryState()
    data class Success(val data: List<SensorData>) : SensorHistoryState()
    data class Error(val message: String) : SensorHistoryState()
}

class SensorHistoryViewModel(
    private val sensorId: String,
    private val repository: GreenhouseRepository = GreenhouseRepository()
) : ViewModel() {

    private val _historyState = MutableStateFlow<SensorHistoryState>(SensorHistoryState.Loading)
    val historyState: StateFlow<SensorHistoryState> = _historyState.asStateFlow()

    init {
        fetchHistory()
    }

    private fun fetchHistory() {
        viewModelScope.launch {
            _historyState.value = SensorHistoryState.Loading
            val result = repository.getSensorDataHistory(sensorId)
            result.fold(
                onSuccess = { data ->
                    _historyState.value = SensorHistoryState.Success(data.sortedByDescending { it.timestamp })
                },
                onFailure = { exception ->
                    _historyState.value = SensorHistoryState.Error(exception.message ?: "Unknown error")
                }
            )
        }
    }

    companion object {
        fun provideFactory(
            sensorId: String,
            repository: GreenhouseRepository = GreenhouseRepository()
        ): ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return SensorHistoryViewModel(sensorId, repository) as T
            }
        }
    }
}