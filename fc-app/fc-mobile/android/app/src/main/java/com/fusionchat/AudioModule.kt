package com.fusionchat

import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.Handler
import android.os.Looper
import android.util.Base64
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.nio.ByteBuffer
import java.nio.ByteOrder

class AudioModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {
    private val sampleRate = 16000
    private var recorder: AudioRecord? = null
    private var isRecording = false

    override fun getName(): String {
        return "AudioModule"
    }

    @ReactMethod
    fun startRecording() {
        val bufferSize =
                AudioRecord.getMinBufferSize(
                        sampleRate,
                        AudioFormat.CHANNEL_IN_MONO,
                        AudioFormat.ENCODING_PCM_16BIT
                ) * 4

        // Log.d("AudioModule", "Buffer size: $bufferSize")

        recorder =
                AudioRecord(
                        MediaRecorder.AudioSource.MIC,
                        sampleRate,
                        AudioFormat.CHANNEL_IN_MONO,
                        AudioFormat.ENCODING_PCM_16BIT,
                        bufferSize
                )

        // Log.d("AudioModule", "Recording started")

        try {
            recorder?.startRecording()
            isRecording = true

            val handler = Handler(Looper.getMainLooper())

            val runnable =
                    object : Runnable {
                        override fun run() {
                            // Log.d("AudioModule", "Runnable created")
                            val buffer = ByteArray(bufferSize)
                            // Log.d("AudioModule", "Buffer created")
                            val read = recorder?.read(buffer, 0, buffer.size)
                            // Log.d("AudioModule", "Read: $read")
                            if (read != null && read > 0) {
                                val sampleRate = 16000
                                val numChannels = 1
                                val bitsPerSample = 16
                            
                                val base64Wav = pcmToWavBase64(buffer, sampleRate, numChannels, bitsPerSample)
                                sendEvent("AudioData", base64Wav)
                            }
                            if (isRecording) {
                                // Log.d("AudioModule", "Runnable running")
                                handler.postDelayed(this, 10)
                            }
                            // Log.d("AudioModule", "Runnable stopped")
                        }
                    }

            handler.post(runnable)
        } catch (e: Exception) {
            Log.e("AudioModule", "Error in startRecording: ${e.message}", e)
            stopRecording()
        }
    }

    private fun sendEvent(eventName: String, data: String) {
        if (reactApplicationContext.hasActiveCatalystInstance()) {
            reactApplicationContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit(eventName, data)
        }
    }

    @ReactMethod
    public fun stopRecording() {
        isRecording = false
        recorder?.stop()
        recorder?.release()
        recorder = null
    }

    fun pcmToWavBase64(pcmData: ByteArray, sampleRate: Int, numChannels: Int, bitsPerSample: Int): String {
        val byteRate = sampleRate * numChannels * bitsPerSample / 8
        val dataSize = pcmData.size
        val totalDataLen = dataSize + 36
    
        val header = ByteBuffer.allocate(44)
        header.order(ByteOrder.LITTLE_ENDIAN)
        header.put("RIFF".toByteArray())
        header.putInt(totalDataLen)
        header.put("WAVE".toByteArray())
        header.put("fmt ".toByteArray())
        header.putInt(16)
        header.putShort(1.toShort()) // Audio format (1 = PCM)
        header.putShort(numChannels.toShort())
        header.putInt(sampleRate)
        header.putInt(byteRate)
        header.putShort((numChannels * bitsPerSample / 8).toShort())
        header.putShort(bitsPerSample.toShort())
        header.put("data".toByteArray())
        header.putInt(dataSize)
    
        val wavData = ByteArray(header.capacity() + pcmData.size)
        System.arraycopy(header.array(), 0, wavData, 0, header.capacity())
        System.arraycopy(pcmData, 0, wavData, header.capacity(), pcmData.size)
    
        return Base64.encodeToString(wavData, Base64.NO_WRAP)
    }
}
