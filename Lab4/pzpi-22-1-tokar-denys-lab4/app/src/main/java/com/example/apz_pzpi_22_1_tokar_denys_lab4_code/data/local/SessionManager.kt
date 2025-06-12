package com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.local

import android.content.Context
import android.content.SharedPreferences
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.model.AuthResponse
import com.google.gson.Gson


class SessionManager(context: Context) {
    private var prefs: SharedPreferences =
        context.getSharedPreferences(Constants.PREFS_TOKEN_FILE, Context.MODE_PRIVATE)
    private val gson = Gson()

    companion object {
        // Можна реалізувати Singleton, якщо потрібно
    }

    fun saveAuthToken(token: String) {
        val editor = prefs.edit()
        editor.putString(Constants.USER_TOKEN, token)
        editor.apply()
    }

    fun fetchAuthToken(): String? {
        return prefs.getString(Constants.USER_TOKEN, null)
    }

    fun saveUserDetails(authResponse: AuthResponse?) { // Зберігаємо весь об'єкт або потрібні поля
        val editor = prefs.edit()
        val userJson = gson.toJson(authResponse)
        editor.putString(Constants.USER_DETAILS, userJson)
        editor.apply()
    }

    fun fetchUserDetails(): AuthResponse? {
        val userJson = prefs.getString(Constants.USER_DETAILS, null)
        return try {
            gson.fromJson(userJson, AuthResponse::class.java)
        } catch (e: Exception) {
            null
        }
    }

    fun clearAuthToken() {
        val editor = prefs.edit()
        editor.remove(Constants.USER_TOKEN)
        editor.remove(Constants.USER_DETAILS)
        editor.apply()
    }
}