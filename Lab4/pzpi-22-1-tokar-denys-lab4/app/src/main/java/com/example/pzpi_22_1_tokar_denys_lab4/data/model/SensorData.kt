package com.example.pzpi_22_1_tokar_denys_lab4.data.model

import com.google.gson.annotations.SerializedName
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

data class SensorData(
    @SerializedName("_id")
    val _id: String,

    @SerializedName("sensorId")
    val sensorId: String,

    @SerializedName("value")
    val value: Any, // Може бути числом або іншим типом

    @SerializedName("timestamp")
    val timestamp: String
) {
    // Допоміжна функція для красивого форматування дати
    val formattedTimestamp: String
        get() {
            return try {
                val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
                parser.timeZone = TimeZone.getTimeZone("UTC")
                val date: Date = parser.parse(timestamp) ?: return timestamp
                val formatter = SimpleDateFormat("dd.MM.yyyy HH:mm:ss", Locale.getDefault())
                formatter.format(date)
            } catch (e: Exception) {
                timestamp // Повертаємо оригінальний рядок у разі помилки парсингу
            }
        }
}