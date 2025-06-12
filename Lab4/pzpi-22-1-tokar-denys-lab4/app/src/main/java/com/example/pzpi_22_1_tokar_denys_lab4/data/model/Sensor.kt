package com.example.pzpi_22_1_tokar_denys_lab4.data.model

data class SensorValue(
    val type: String,
    val model: String,
    val value: Any?,
    val unit: String,
    val lastUpdated: String?
)