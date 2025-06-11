package com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.model

data class Greenhouse(
    val _id: String,
    val name: String,
    val location: String?,
    val ownerId: String, // Або об'єкт User, якщо API повертає вкладені дані
    val hardwareId: String?
    // Додайте інші поля, якщо потрібно
)