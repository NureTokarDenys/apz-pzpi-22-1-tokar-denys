package com.example.pzpi_22_1_tokar_denys_lab4.data.network

import android.content.Context
import com.example.pzpi_22_1_tokar_denys_lab4.data.model.GreenhouseInfo
import com.google.gson.GsonBuilder
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object ApiClient {
    private const val BASE_URL = "http://192.168.1.189:5000/api/"

    private lateinit var apiService: ApiService

    fun initialize(context: Context) {
        if (::apiService.isInitialized) {
            return
        }

        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val authInterceptor = AuthInterceptor(context)

        // Створюємо кастомний Gson
        val gson = GsonBuilder()
            // Реєструємо наш десеріалізатор для типу GreenhouseInfo
            .registerTypeAdapter(GreenhouseInfo::class.java, GreenhouseInfoDeserializer())
            .create()

        val httpClient = OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .addInterceptor(authInterceptor)
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(httpClient)
            // Використовуємо наш кастомний Gson
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()

        apiService = retrofit.create(ApiService::class.java)
    }

    val instance: ApiService
        get() {
            if (!::apiService.isInitialized) {
                throw UninitializedPropertyAccessException("ApiClient has not been initialized. Call ApiClient.initialize(context) in your Application class.")
            }
            return apiService
        }
}