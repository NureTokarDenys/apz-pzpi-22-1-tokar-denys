package com.example.apz_pzpi_22_1_tokar_denys_lab4_code.data.model

data class User(
    val _id: String,
    val username: String,
    val email: String?,
    val role: String,
    // Можливо, тут буде токен, якщо ви його зберігаєте після логіну
)

data class AuthResponse(
    val _id: String,
    val username: String,
    val email: String?,
    val role: String,
    val token: String
)