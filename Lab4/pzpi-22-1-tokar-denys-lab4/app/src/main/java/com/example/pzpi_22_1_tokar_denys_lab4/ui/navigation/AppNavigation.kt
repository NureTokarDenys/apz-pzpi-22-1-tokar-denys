package com.example.pzpi_22_1_tokar_denys_lab4.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.pzpi_22_1_tokar_denys_lab4.data.local.SessionManager
import com.example.pzpi_22_1_tokar_denys_lab4.ui.screens.DashboardScreen
import com.example.pzpi_22_1_tokar_denys_lab4.ui.screens.GreenhouseDetailScreen
import com.example.pzpi_22_1_tokar_denys_lab4.ui.screens.LoginScreen
import com.example.pzpi_22_1_tokar_denys_lab4.ui.screens.SensorHistoryScreen

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val context = LocalContext.current
    val sessionManager = SessionManager(context)

    val startDestination = if (sessionManager.fetchAuthToken() != null) {
        "dashboard"
    } else {
        "login"
    }

    NavHost(navController = navController, startDestination = startDestination) {
        composable("login") { LoginScreen(navController) }
        composable("dashboard") { DashboardScreen(navController) }
        composable(
            route = "greenhouseDetail/{greenhouseId}",
            arguments = listOf(navArgument("greenhouseId") { type = NavType.StringType })
        ) { backStackEntry ->
            val greenhouseId = backStackEntry.arguments?.getString("greenhouseId")
            requireNotNull(greenhouseId) { "greenhouseId parameter missing" }
            GreenhouseDetailScreen(navController, greenhouseId)
        }

        composable(
            route = "sensorHistory/{sensorId}/{sensorType}/{sensorModel}/{sensorUnit}",
            arguments = listOf(
                navArgument("sensorId") { type = NavType.StringType },
                navArgument("sensorType") { type = NavType.StringType },
                navArgument("sensorModel") { type = NavType.StringType },
                navArgument("sensorUnit") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val sensorId = backStackEntry.arguments?.getString("sensorId")
            val sensorType = backStackEntry.arguments?.getString("sensorType")
            val sensorModel = backStackEntry.arguments?.getString("sensorModel")
            val sensorUnit = backStackEntry.arguments?.getString("sensorUnit")

            requireNotNull(sensorId)
            requireNotNull(sensorType)
            requireNotNull(sensorModel)
            requireNotNull(sensorUnit)

            SensorHistoryScreen(navController, sensorId, sensorType, sensorModel, sensorUnit)
        }
    }
}