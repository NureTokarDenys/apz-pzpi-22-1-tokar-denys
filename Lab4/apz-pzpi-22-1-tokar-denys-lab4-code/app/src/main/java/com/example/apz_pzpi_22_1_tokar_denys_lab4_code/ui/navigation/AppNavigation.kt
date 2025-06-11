package com.example.apz_pzpi_22_1_tokar_denys_lab4_code.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.ui.screens.DashboardScreen
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.ui.screens.GreenhouseDetailScreen
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.ui.screens.LoginScreen
import com.example.apz_pzpi_22_1_tokar_denys_lab4_code.ui.screens.RegisterScreen

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    // TODO: Визначити стартовий екран залежно від стану автентифікації
    // Наприклад, перевіряти, чи є збережений токен
    val startDestination = "login" // Або "dashboard", якщо користувач вже увійшов

    NavHost(navController = navController, startDestination = startDestination) {
        composable("login") { LoginScreen(navController) }
        composable("register") { RegisterScreen(navController) }
        composable("dashboard") { DashboardScreen(navController) }
        composable(
            route = "greenhouseDetail/{greenhouseId}",
            arguments = listOf(navArgument("greenhouseId") { type = NavType.StringType })
        ) { backStackEntry ->
            val greenhouseId = backStackEntry.arguments?.getString("greenhouseId")
            requireNotNull(greenhouseId) { "greenhouseId parameter missing" }
            GreenhouseDetailScreen(navController, greenhouseId)
        }
        // Додайте інші роути тут
    }
}