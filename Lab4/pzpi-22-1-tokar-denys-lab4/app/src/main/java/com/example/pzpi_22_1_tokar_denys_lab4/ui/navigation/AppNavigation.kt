package com.example.pzpi_22_1_tokar_denys_lab4.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.pzpi_22_1_tokar_denys_lab4.ui.screens.DashboardScreen
import com.example.pzpi_22_1_tokar_denys_lab4.ui.screens.GreenhouseDetailScreen
import com.example.pzpi_22_1_tokar_denys_lab4.ui.screens.LoginScreen
import com.example.pzpi_22_1_tokar_denys_lab4.ui.screens.RegisterScreen

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