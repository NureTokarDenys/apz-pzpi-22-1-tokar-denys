package com.example.pzpi_22_1_tokar_denys_lab4.data.repository

import com.example.pzpi_22_1_tokar_denys_lab4.data.model.AuthResponse
import com.example.pzpi_22_1_tokar_denys_lab4.data.network.ApiClient
import com.example.pzpi_22_1_tokar_denys_lab4.data.network.LoginRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AuthRepository {
    private val apiService = ApiClient.instance

    suspend fun login(username: String, password: String): Result<AuthResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.login(LoginRequest(username, password))
                if (response.isSuccessful && response.body() != null) {
                    Result.success(response.body()!!)
                } else {
                    val errorBody = response.errorBody()?.string()
                    Result.failure(Exception(errorBody ?: "Login failed with code ${response.code()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
}