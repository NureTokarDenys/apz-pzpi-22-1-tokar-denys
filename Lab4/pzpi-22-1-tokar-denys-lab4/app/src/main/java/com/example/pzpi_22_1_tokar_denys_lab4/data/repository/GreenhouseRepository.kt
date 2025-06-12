package com.example.pzpi_22_1_tokar_denys_lab4.data.repository

import com.example.pzpi_22_1_tokar_denys_lab4.data.model.Greenhouse
import com.example.pzpi_22_1_tokar_denys_lab4.data.model.Rule
import com.example.pzpi_22_1_tokar_denys_lab4.data.model.SensorValue
import com.example.pzpi_22_1_tokar_denys_lab4.data.network.ApiClient
import com.example.pzpi_22_1_tokar_denys_lab4.data.network.ManualActionRequest
import com.example.pzpi_22_1_tokar_denys_lab4.data.network.StatusUpdateRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class GreenhouseRepository {
    private val apiService = ApiClient.instance

    suspend fun getGreenhouses(token: String): Result<List<Greenhouse>> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getGreenhouses(token)
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

    suspend fun getCurrentGreenhouseData(token: String, greenhouseId: String): Result<List<SensorValue>> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getCurrentGreenhouseData(token, greenhouseId)
                if (response.isSuccessful && response.body() != null) {
                    Result.success(response.body()!!)
                } else {
                    Result.failure(Exception(response.errorBody()?.string() ?: "Failed to fetch current data"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    suspend fun getRulesForGreenhouse(token: String, greenhouseId: String): Result<List<Rule>> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getRulesForGreenhouse(token, greenhouseId)
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

    suspend fun updateRuleStatus(token: String, ruleId: String, newStatus: String): Result<Rule> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.updateRuleStatus(token, ruleId, StatusUpdateRequest(newStatus))
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

    suspend fun requestManualAction(token: String, greenhouseId: String, action: ManualActionRequest): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.requestManualAction(token, greenhouseId, action)
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