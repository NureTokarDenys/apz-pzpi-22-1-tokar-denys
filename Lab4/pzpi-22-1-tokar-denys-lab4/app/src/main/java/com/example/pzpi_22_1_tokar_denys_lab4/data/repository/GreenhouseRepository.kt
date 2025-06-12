package com.example.pzpi_22_1_tokar_denys_lab4.data.repository

import com.example.pzpi_22_1_tokar_denys_lab4.data.model.Greenhouse
import com.example.pzpi_22_1_tokar_denys_lab4.data.model.Rule
import com.example.pzpi_22_1_tokar_denys_lab4.data.model.Sensor
import com.example.pzpi_22_1_tokar_denys_lab4.data.model.SensorData
import com.example.pzpi_22_1_tokar_denys_lab4.data.network.ApiClient
import com.example.pzpi_22_1_tokar_denys_lab4.data.network.ManualActionRequest
import com.example.pzpi_22_1_tokar_denys_lab4.data.network.RuleUpdateRequest
import com.example.pzpi_22_1_tokar_denys_lab4.data.network.StatusUpdateRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class GreenhouseRepository {
    private val apiService = ApiClient.instance

    // ... (існуючі методи getGreenhouses, getSensorsForGreenhouse, getRulesForGreenhouse) ...

    suspend fun getGreenhouses(): Result<List<Greenhouse>> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getGreenhouses()
                if (response.isSuccessful && response.body() != null) {
                    Result.success(response.body()!!)
                } else {
                    Result.failure(Exception(response.errorBody()?.string() ?: "Failed to fetch greenhouses"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    suspend fun getSensorsForGreenhouse(greenhouseId: String): Result<List<Sensor>> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getSensorsForGreenhouse(greenhouseId)
                if (response.isSuccessful && response.body() != null) {
                    Result.success(response.body()!!)
                } else {
                    Result.failure(Exception(response.errorBody()?.string() ?: "Failed to fetch sensors"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    suspend fun getRulesForGreenhouse(greenhouseId: String): Result<List<Rule>> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getRulesForGreenhouse(greenhouseId)
                if (response.isSuccessful && response.body() != null) {
                    Result.success(response.body()!!)
                } else {
                    Result.failure(Exception(response.errorBody()?.string() ?: "Failed to fetch rules"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    suspend fun updateRuleStatus(ruleId: String, newStatus: String): Result<Rule> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.updateRuleStatus(ruleId, StatusUpdateRequest(newStatus))
                if (response.isSuccessful && response.body() != null) {
                    Result.success(response.body()!!)
                } else {
                    Result.failure(Exception(response.errorBody()?.string() ?: "Failed to update rule status"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    suspend fun updateRule(ruleId: String, updatedRuleData: RuleUpdateRequest): Result<Rule> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.updateRule(ruleId, updatedRuleData)
                if (response.isSuccessful && response.body() != null) {
                    Result.success(response.body()!!)
                } else {
                    Result.failure(Exception(response.errorBody()?.string() ?: "Failed to update rule"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    suspend fun getSensorDataHistory(sensorId: String): Result<List<SensorData>> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getSensorDataHistory(sensorId)
                if (response.isSuccessful && response.body() != null) {
                    Result.success(response.body()!!)
                } else {
                    Result.failure(Exception(response.errorBody()?.string() ?: "Failed to fetch sensor history"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    suspend fun requestManualAction(greenhouseId: String, action: ManualActionRequest): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.requestManualAction(greenhouseId, action)
                if (response.isSuccessful) {
                    Result.success(Unit)
                } else {
                    Result.failure(Exception(response.errorBody()?.string() ?: "Failed to request manual action"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
}