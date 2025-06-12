package com.example.pzpi_22_1_tokar_denys_lab4.data.model

import com.google.gson.annotations.SerializedName

data class Rule(
    @SerializedName("_id")
    val _id: String,

    @SerializedName("greenhouseId")
    val greenhouseId: GreenhouseInfo,

    @SerializedName("condition")
    val condition: String,

    @SerializedName("action")
    val action: String,

    @SerializedName("threshold")
    val threshold: Threshold,

    @SerializedName("status")
    val status: String
)

data class Threshold(
    @SerializedName("sensorModelId")
    val sensorModelId: String,

    @SerializedName("operator")
    val operator: String,

    @SerializedName("value")
    val value: Double
)

data class GreenhouseInfo(
    @SerializedName("_id")
    val _id: String,

    @SerializedName("name")
    val name: String
)