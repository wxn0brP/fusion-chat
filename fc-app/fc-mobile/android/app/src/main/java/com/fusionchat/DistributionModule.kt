package com.fusionchat

import android.content.pm.PackageManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class InstallSourceModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "InstallSourceModule"
    }

    @ReactMethod
    fun getInstallerPackageName(promise: Promise) {
        val pm: PackageManager = reactApplicationContext.packageManager
        val packageName: String = reactApplicationContext.packageName
        val installerPackageName = pm.getInstallerPackageName(packageName)

        promise.resolve(installerPackageName ?: "unknown")
    }
}
