package com.example.pzpi_22_1_tokar_denys_lab4.data.model

import com.google.gson.annotations.SerializedName

data class Greenhouse(
    @SerializedName("_id")
    val _id: String,

    @SerializedName("name")
    val name: String,

    @SerializedName("location")
    val location: String?,

    @SerializedName("ownerId")
    val ownerId: Owner
)

data class Owner(
    @SerializedName("_id")
    val _id: String,

    @SerializedName("username")
    val username: String
)