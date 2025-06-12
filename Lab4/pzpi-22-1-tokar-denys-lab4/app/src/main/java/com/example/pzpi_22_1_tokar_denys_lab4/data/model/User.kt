package com.example.pzpi_22_1_tokar_denys_lab4.data.model

data class User(
    val _id: String,
    val username: String,
    val email: String?,
    val role: String,
)

data class AuthResponse(
    val _id: String,
    val username: String,
    val email: String?,
    val role: String,
    val token: String
)