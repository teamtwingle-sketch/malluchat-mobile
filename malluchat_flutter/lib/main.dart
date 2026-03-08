import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:permission_handler/permission_handler.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MalluChatApp());
}

class MalluChatApp extends StatelessWidget {
  const MalluChatApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MalluChat',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primarySwatch: Colors.blue,
      ),
      home: const WebViewScreen(),
    );
  }
}

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  final GlobalKey webViewKey = GlobalKey();
  InAppWebViewController? webViewController;
  InAppWebViewSettings settings = InAppWebViewSettings(
      userAgent: "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 MalluChatApp",
      mediaPlaybackRequiresUserGesture: false,
      allowsInlineMediaPlayback: true,
      iframeAllowFullscreen: true,
      javaScriptEnabled: true,
      supportZoom: false,
      builtInZoomControls: false,
      displayZoomControls: false,
    );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: InAppWebView(
          key: webViewKey,
          initialUrlRequest: URLRequest(url: WebUri("https://malluchat.online")),
          initialSettings: settings,
          onWebViewCreated: (controller) {
            webViewController = controller;
          },
          onPermissionRequest: (controller, request) async {
            // Native Android popup to gracefully ask right when the button is clicked!
            await [
              Permission.camera,
              Permission.microphone,
            ].request();
            
            // Automatically grant permissions to the WebView once Android grants physical access
            return PermissionResponse(
                resources: request.resources,
                action: PermissionResponseAction.GRANT);
          },
        ),
      ),
    );
  }
}
