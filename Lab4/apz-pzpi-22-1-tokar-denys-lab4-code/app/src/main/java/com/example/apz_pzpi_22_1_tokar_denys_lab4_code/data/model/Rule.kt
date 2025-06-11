package com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.model

data class Threshold(
    val sensorModelId: String,
    val operator: String,
    val value: Any
)

data class Rule(
    val _id: String,
    val greenhouseId: String,
    val condition: String, // 'sensor_based'
    val action: String,
    val threshold: Threshold,
    var status: String // 'active' or 'inactive' - var, щоб можна було змінювати локально
)