package com.example.pzpi_22_1_tokar_denys_lab4.data.model

data class Threshold(
    val sensorModelId: String,
    val operator: String,
    val value: Any
)

data class Rule(
    val _id: String,
    val greenhouseId: String,
    val condition: String,
    val action: String,
    val threshold: Threshold,
    var status: String
)