package com.example.pzpi_22_1_tokar_denys_lab4.data.model

data class Sensor(
    val _id: String,
    val model: String,
    val type: String,
    val unit: String,
    val lastValue: Any?,
    val lastUpdated: String?
)