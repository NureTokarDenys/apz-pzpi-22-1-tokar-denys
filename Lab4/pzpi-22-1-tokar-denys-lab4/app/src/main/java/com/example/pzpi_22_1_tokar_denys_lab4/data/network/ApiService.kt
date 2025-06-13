package com.example.pzpi_22_1_tokar_denys_lab4.data.network

import com.example.pzpi_22_1_tokar_denys_lab4.data.model.AuthResponse
import com.example.pzpi_22_1_tokar_denys_lab4.data.model.Greenhouse
import com.example.pzpi_22_1_tokar_denys_lab4.data.model.Rule
import com.example.pzpi_22_1_tokar_denys_lab4.data.model.Sensor
import com.example.pzpi_22_1_tokar_denys_lab4.data.model.SensorData
import com.example.pzpi_22_1_tokar_denys_lab4.data.model.Threshold
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    @POST("users/login")
    suspend fun login(@Body loginRequest: LoginRequest): Response<AuthResponse>

    @GET("greenhouses")
    suspend fun getGreenhouses(): Response<List<Greenhouse>>

    @GET("sensors/greenhouse/{greenhouseId}")
    suspend fun getSensorsForGreenhouse(
        @Path("greenhouseId") greenhouseId: String
    ): Response<List<Sensor>>

    @GET("rules/greenhouse/{greenhouseId}")
    suspend fun getRulesForGreenhouse(
        @Path("greenhouseId") greenhouseId: String
    ): Response<List<Rule>>

    @PATCH("rules/{ruleId}")
    suspend fun updateRuleStatus(
        @Path("ruleId") ruleId: String,
        @Body statusUpdateRequest: StatusUpdateRequest
    ): Response<Rule>

    @PATCH("rules/{ruleId}")
    suspend fun updateRule(
        @Path("ruleId") ruleId: String,
        @Body ruleUpdateRequest: RuleUpdateRequest
    ): Response<Rule>

    @GET("sensordata/sensor/{sensorId}")
    suspend fun getSensorDataHistory(
        @Path("sensorId") sensorId: String
    ): Response<List<SensorData>>

    @POST("greenhouses/{greenhouseId}/actions")
    suspend fun requestManualAction(
        @Path("greenhouseId") greenhouseId: String,
        @Body manualActionRequest: ManualActionRequest
    ): Response<Unit>

    @POST("users/fcm-token")
    suspend fun sendFcmToken(@Body fcmTokenRequest: FcmTokenRequest): Response<Unit>
}

data class LoginRequest(val username: String, val password: String)
data class StatusUpdateRequest(val status: String)
data class ManualActionRequest(val action: String, val deviceId: String? = null, val value: Any? = null)
data class FcmTokenRequest(val fcmToken: String)

data class RuleUpdateRequest(
    val action: String,
    val threshold: Threshold
)