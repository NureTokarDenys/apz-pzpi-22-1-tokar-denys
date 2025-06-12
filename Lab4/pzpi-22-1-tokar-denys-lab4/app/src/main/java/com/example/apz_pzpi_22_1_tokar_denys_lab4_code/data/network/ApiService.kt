package com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.network

import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.model.AuthResponse
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.model.Greenhouse
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.model.Rule
// Додайте інші моделі для запитів/відповідей
import retrofit2.Response // Важливо використовувати Response для обробки помилок
import retrofit2.http.*

interface ApiService {

    @POST("users/login")
    suspend fun login(@Body loginRequest: LoginRequest): Response<AuthResponse> // Використовуйте Response

    @POST("users/register")
    suspend fun register(@Body registerRequest: RegisterRequest): Response<AuthResponse>

    // Отримання теплиць для поточного користувача (потрібен токен)
    @GET("greenhouses")
    suspend fun getGreenhouses(@Header("Authorization") token: String): Response<List<Greenhouse>>

    // Отримання поточних даних для конкретної теплиці (приклад, потрібно буде створити такий ендпоінт на бекенді)
    // Або отримувати список сенсорів, а потім їх останні значення
    @GET("greenhouses/{greenhouseId}/current-data") // Цей ендпоінт треба буде створити на бекенді
    suspend fun getCurrentGreenhouseData(
        @Header("Authorization") token: String,
        @Path("greenhouseId") greenhouseId: String
    ): Response<List<com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.model.SensorValue>> // Список значень сенсорів

    @GET("rules/greenhouse/{greenhouseId}")
    suspend fun getRulesForGreenhouse(
        @Header("Authorization") token: String,
        @Path("greenhouseId") greenhouseId: String
    ): Response<List<Rule>>

    @PATCH("rules/{ruleId}")
    suspend fun updateRuleStatus(
        @Header("Authorization") token: String,
        @Path("ruleId") ruleId: String,
        @Body statusUpdateRequest: StatusUpdateRequest // data class StatusUpdateRequest(val status: String)
    ): Response<Rule>

    // Ендпоінт для ініціювання моментальної дії
    @POST("greenhouses/{greenhouseId}/actions")
    suspend fun requestManualAction(
        @Header("Authorization") token: String,
        @Path("greenhouseId") greenhouseId: String,
        @Body manualActionRequest: ManualActionRequest // data class ManualActionRequest(val action: String, val deviceId: String?, val value: Any?)
    ): Response<Unit> // Або модель відповіді, якщо сервер щось повертає
}

// Допоміжні data класи для запитів
data class LoginRequest(val username: String, val password: String)
data class RegisterRequest(val username: String, val email: String, val password: String)
data class StatusUpdateRequest(val status: String)
data class ManualActionRequest(val action: String, val deviceId: String? = null, val value: Any? = null)