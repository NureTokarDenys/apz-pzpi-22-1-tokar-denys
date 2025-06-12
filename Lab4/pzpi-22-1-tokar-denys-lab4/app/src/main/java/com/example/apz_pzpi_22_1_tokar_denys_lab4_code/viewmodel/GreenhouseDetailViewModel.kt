package com.example.apz_pzpi_22_1_tokar_denys_lab4_code.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.model.Greenhouse
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.model.Rule
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.model.SensorValue
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.network.ManualActionRequest
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.repository.GreenhouseRepository
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class GreenhouseDetailState {
    object Idle : GreenhouseDetailState()
    object Loading : GreenhouseDetailState()
    data class Success(
        val greenhouse: Greenhouse?,
        val currentSensorData: List<SensorValue>,
        val rules: List<Rule>
    ) : GreenhouseDetailState()
    data class Error(val message: String) : GreenhouseDetailState()
}

class GreenhouseDetailViewModel(
    private val greenhouseId: String,
    private val greenhouseRepository: GreenhouseRepository = GreenhouseRepository()
) : ViewModel() {

    private val _detailState = MutableStateFlow<GreenhouseDetailState>(GreenhouseDetailState.Idle)
    val detailState: StateFlow<GreenhouseDetailState> = _detailState.asStateFlow()

    fun fetchGreenhouseDetails(token: String) {
        viewModelScope.launch {
            _detailState.value = GreenhouseDetailState.Loading
            try {
                coroutineScope {
                    val allGreenhousesDeferred = async { greenhouseRepository.getGreenhouses(token) }
                    val currentDataDeferred = async { greenhouseRepository.getCurrentGreenhouseData(token, greenhouseId) }
                    val rulesDeferred = async { greenhouseRepository.getRulesForGreenhouse(token, greenhouseId) }

                    val allGreenhousesResult = allGreenhousesDeferred.await()
                    val currentDataResult = currentDataDeferred.await()
                    val rulesResult = rulesDeferred.await()

                    if (allGreenhousesResult.isFailure || currentDataResult.isFailure || rulesResult.isFailure) {
                        val errorMsg = allGreenhousesResult.exceptionOrNull()?.message
                            ?: currentDataResult.exceptionOrNull()?.message
                            ?: rulesResult.exceptionOrNull()?.message
                            ?: "Failed to load greenhouse details"
                        _detailState.value = GreenhouseDetailState.Error(errorMsg)
                        return@coroutineScope
                    }

                    val targetGreenhouse = allGreenhousesResult.getOrThrow().find { it._id == greenhouseId }

                    _detailState.value = GreenhouseDetailState.Success(
                        greenhouse = targetGreenhouse,
                        currentSensorData = currentDataResult.getOrThrow(),
                        rules = rulesResult.getOrThrow()
                    )
                }
            } catch (e: Exception) {
                _detailState.value = GreenhouseDetailState.Error(e.message ?: "Unknown error")
            }
        }
    }

    fun updateRuleStatus(token: String, ruleId: String, newStatus: String) {
        viewModelScope.launch {
            val currentState = _detailState.value
            if (currentState is GreenhouseDetailState.Success) {
                val updatedRules = currentState.rules.map {
                    if (it._id == ruleId) it.copy(status = newStatus) else it
                }
                _detailState.value = currentState.copy(rules = updatedRules)
            }

            val result = greenhouseRepository.updateRuleStatus(token, ruleId, newStatus)
            result.onFailure { exception ->
                _detailState.value = GreenhouseDetailState.Error(exception.message ?: "Failed to update rule")
                fetchGreenhouseDetails(token)
            }
        }
    }

    fun requestManualAction(token: String, action: String, deviceId: String? = null, value: Any? = null) {
        viewModelScope.launch {
            val request = ManualActionRequest(action, deviceId, value)
            val result = greenhouseRepository.requestManualAction(token, greenhouseId, request)
            result.onFailure { exception ->
                println("Error requesting manual action: ${exception.message}")
            }
            result.onSuccess {
                println("Manual action requested successfully for $greenhouseId")
            }
        }
    }

    companion object {
        fun provideFactory(
            greenhouseId: String,
            greenhouseRepository: GreenhouseRepository = GreenhouseRepository()
        ): ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return GreenhouseDetailViewModel(greenhouseId, greenhouseRepository) as T
            }
        }
    }
}