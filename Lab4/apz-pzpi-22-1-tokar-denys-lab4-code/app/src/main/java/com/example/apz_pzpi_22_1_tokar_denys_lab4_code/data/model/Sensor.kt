package com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.model

data class SensorValue(
    val type: String, // 'temperature', 'humidity', 'light', 'soil_moisture'
    val model: String, // Унікальний ID сенсора, напр. "ESP32HWID_TEMP"
    val value: Any?,   // Може бути Double, Int, String залежно від типу
    val unit: String,
    val lastUpdated: String? // Дата як рядок, потім можна парсити
)