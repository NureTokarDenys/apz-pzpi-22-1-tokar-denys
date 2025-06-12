package com.example.pzpi_22_1_tokar_denys_lab4

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import com.example.pzpi_22_1_tokar_denys_lab4.ui.theme.Pzpi221tokardenyslab4Theme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import com.example.pzpi_22_1_tokar_denys_lab4.data.network.ApiClient
import com.example.pzpi_22_1_tokar_denys_lab4.ui.navigation.AppNavigation

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ApiClient.initialize(this)
        setContent {
            Pzpi221tokardenyslab4Theme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppNavigation()
                }
            }
        }
    }
}