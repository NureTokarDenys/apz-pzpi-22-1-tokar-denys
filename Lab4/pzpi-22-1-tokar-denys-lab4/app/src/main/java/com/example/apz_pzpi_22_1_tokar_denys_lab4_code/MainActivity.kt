package com.example.apz_pzpi_22_1_tokar_denys_lab4_code

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.ui.theme.Apzpzpi221tokardenyslab4codeTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.ui.navigation.AppNavigation

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Apzpzpi221tokardenyslab4codeTheme {
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