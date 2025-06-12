package com.example.pzpi_22_1_tokar_denys_lab4.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.pzpi_22_1_tokar_denys_lab4.data.model.Greenhouse
import com.example.pzpi_22_1_tokar_denys_lab4.data.model.Rule
import com.example.pzpi_22_1_tokar_denys_lab4.data.model.Sensor
import com.example.pzpi_22_1_tokar_denys_lab4.data.network.ManualActionRequest
import com.example.pzpi_22_1_tokar_denys_lab4.data.network.RuleUpdateRequest
import com.example.pzpi_22_1_tokar_denys_lab4.data.repository.GreenhouseRepository
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

// ... (sealed class GreenhouseDetailState) ...
sealed class GreenhouseDetailState {
    object Idle : GreenhouseDetailState()
    object Loading : GreenhouseDetailState()
    data class Success(
        val greenhouse: Greenhouse?,
        val sensors: List<Sensor>,
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

    // ... (fetchGreenhouseDetails, updateRuleStatus, requestManualAction) ...

    fun fetchGreenhouseDetails() {
        viewModelScope.launch {
            _detailState.value = GreenhouseDetailState.Loading
            try {
                coroutineScope {
                    val allGreenhousesDeferred = async { greenhouseRepository.getGreenhouses() }
                    val sensorsDeferred = async { greenhouseRepository.getSensorsForGreenhouse(greenhouseId) }
                    val rulesDeferred = async { greenhouseRepository.getRulesForGreenhouse(greenhouseId) }

                    val allGreenhousesResult = allGreenhousesDeferred.await()
                    val sensorsResult = sensorsDeferred.await()
                    val rulesResult = rulesDeferred.await()

                    if (allGreenhousesResult.isFailure || sensorsResult.isFailure || rulesResult.isFailure) {
                        val errorMsg = allGreenhousesResult.exceptionOrNull()?.message
                            ?: sensorsResult.exceptionOrNull()?.message
                            ?: rulesResult.exceptionOrNull()?.message
                            ?: "Failed to load greenhouse details"
                        _detailState.value = GreenhouseDetailState.Error(errorMsg)
                        return@coroutineScope
                    }

                    val targetGreenhouse = allGreenhousesResult.getOrThrow().find { it._id == greenhouseId }

                    _detailState.value = GreenhouseDetailState.Success(
                        greenhouse = targetGreenhouse,
                        sensors = sensorsResult.getOrThrow(),
                        rules = rulesResult.getOrThrow()
                    )
                }
            } catch (e: Exception) {
                _detailState.value = GreenhouseDetailState.Error(e.message ?: "Unknown error")
            }
        }
    }

    fun updateRuleStatus(ruleId: String, newStatus: String) {
        viewModelScope.launch {
            val currentState = _detailState.value
            if (currentState is GreenhouseDetailState.Success) {
                val updatedRules = currentState.rules.map {
                    if (it._id == ruleId) it.copy(status = newStatus) else it
                }
                _detailState.value = currentState.copy(rules = updatedRules)
            }

            val result = greenhouseRepository.updateRuleStatus(ruleId, newStatus)
            result.onFailure { exception ->
                _detailState.value = GreenhouseDetailState.Error(exception.message ?: "Failed to update rule")
                fetchGreenhouseDetails() // Повертаємо стан у разі помилки
            }
        }
    }

    // Новий метод для оновлення правила
    fun updateRule(updatedRule: Rule) {
        viewModelScope.launch {
            val requestBody = RuleUpdateRequest(
                action = updatedRule.action,
                threshold = updatedRule.threshold
            )
            val result = greenhouseRepository.updateRule(updatedRule._id, requestBody)

            result.fold(
                onSuccess = { savedRule ->
                    // Оновлюємо список правил в UI після успішної відповіді від сервера
                    val currentState = _detailState.value
                    if (currentState is GreenhouseDetailState.Success) {
                        val newRules = currentState.rules.map {
                            if (it._id == savedRule._id) savedRule else it
                        }
                        _detailState.value = currentState.copy(rules = newRules)
                    }
                },
                onFailure = { exception ->
                    // У разі помилки можна показати повідомлення
                    _detailState.value = GreenhouseDetailState.Error(exception.message ?: "Failed to update rule")
                }
            )
        }
    }

    fun requestManualAction(action: String, deviceId: String? = null, value: Any? = null) {
        viewModelScope.launch {
            val request = ManualActionRequest(action, deviceId, value)
            val result = greenhouseRepository.requestManualAction(greenhouseId, request)
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