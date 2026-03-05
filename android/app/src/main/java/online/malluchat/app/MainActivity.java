package online.malluchat.app;

import android.Manifest;
import android.os.Bundle;
import android.content.pm.PackageManager;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }
    
    @Override
    public void onStart() {
        super.onStart();
        
        // Expose native permission request function to Javascript WebView
        this.bridge.getWebView().addJavascriptInterface(new Object() {
            @android.webkit.JavascriptInterface
            public void askPermissions() {
                String[] permissions = {
                        Manifest.permission.CAMERA,
                        Manifest.permission.RECORD_AUDIO,
                        Manifest.permission.MODIFY_AUDIO_SETTINGS
                };
                boolean needsRequest = false;
                for (String permission : permissions) {
                    if (ContextCompat.checkSelfPermission(MainActivity.this, permission) != PackageManager.PERMISSION_GRANTED) {
                        needsRequest = true;
                        break;
                    }
                }
                
                if (needsRequest) {
                    ActivityCompat.requestPermissions(MainActivity.this, permissions, 100);
                }
            }
        }, "MalluNative");
    }
}
