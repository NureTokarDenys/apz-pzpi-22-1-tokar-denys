package com.example.pzpi_22_1_tokar_denys_lab4.data.repository

import android.util.Log
import com.example.pzpi_22_1_tokar_denys_lab4.data.network.ApiClient
import com.example.pzpi_22_1_tokar_denys_lab4.data.network.FcmTokenRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class UserRepository {
    private val apiService = ApiClient.instance

    suspend fun sendFcmToken(token: String) {
        withContext(Dispatchers.IO) {
            try {
                val response = apiService.sendFcmToken(FcmTokenRequest(token))
                if (response.isSuccessful) {
                    Log.d("FCM", "Token sent to server successfully.")
                } else {
                    Log.e("FCM", "Failed to send token: ${response.errorBody()?.string()}")
                }
            } catch (e: Exception) {
                Log.e("FCM", "Exception when sending token", e)
            }
        }
    }
}