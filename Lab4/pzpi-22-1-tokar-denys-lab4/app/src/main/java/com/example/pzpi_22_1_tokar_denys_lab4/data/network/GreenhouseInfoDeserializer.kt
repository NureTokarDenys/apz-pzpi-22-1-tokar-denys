package com.example.pzpi_22_1_tokar_denys_lab4.data.network

import com.example.pzpi_22_1_tokar_denys_lab4.data.model.GreenhouseInfo
import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import java.lang.reflect.Type

class GreenhouseInfoDeserializer : JsonDeserializer<GreenhouseInfo> {
    override fun deserialize(
        json: JsonElement?,
        typeOfT: Type?,
        context: JsonDeserializationContext?
    ): GreenhouseInfo {
        if (json != null) {
            // Перевіряємо, чи є json об'єктом
            if (json.isJsonObject) {
                val jsonObject = json.asJsonObject
                // Парсимо як об'єкт
                val id = jsonObject.get("_id")?.asString ?: ""
                val name = jsonObject.get("name")?.asString ?: "Unknown" // Заглушка, якщо немає імені
                return GreenhouseInfo(_id = id, name = name)
            }
            // Якщо це не об'єкт, то це рядок (ID)
            else if (json.isJsonPrimitive && json.asJsonPrimitive.isString) {
                val id = json.asString
                // Створюємо об'єкт GreenhouseInfo тільки з ID
                return GreenhouseInfo(_id = id, name = "Loading...") // Заглушка для імені
            }
        }
        // Повертаємо пустий об'єкт у разі помилки/null
        return GreenhouseInfo(_id = "", name = "Error")
    }
}