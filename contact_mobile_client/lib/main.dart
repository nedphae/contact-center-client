import 'dart:io';

import 'package:contact_mobile_client/common/config.dart';
import 'package:contact_mobile_client/common/globals.dart';
import 'package:contact_mobile_client/pages/home.dart';
import 'package:contact_mobile_client/pages/login.dart';
import 'package:contact_mobile_client/pages/new_chat.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() async {
  await initHiveForFlutter();
  Globals.prefs = await SharedPreferences.getInstance();
  // 重新打开，清理 graphQL 缓存
  graphQLClient.cache.store.reset();
  runApp(
    /// Providers are above [MyApp] instead of inside it, so that tests
    /// can use [MyApp] while mocking the providers
    const ProviderScope(
      child: MyApp(),
    ),
  );
}

class MyApp extends StatefulHookConsumerWidget {
  const MyApp({super.key});

  @override
  MyAppState createState() => MyAppState();

  static MyAppState? of(BuildContext context) =>
      context.findAncestorStateOfType<MyAppState>();
}

class MyAppState extends ConsumerState<MyApp> {
  Locale _locale = Locale.fromSubtags(
      languageCode: Globals.prefs.getString(Globals.language) ?? Platform.localeName.split('_')[0]);

  String _getLocalData(WidgetRef ref) {
    final token = Globals.prefs.getString(Globals.prefsOauthToken);
    if (token != null) {
      return '/home';
    } else {
      return '/login';
    }
  }

  Locale getLocal() {
    return _locale;
  }

  void setLocale(Locale value) {
    setState(() {
      _locale = value;
      Globals.prefs.setString(Globals.language, value.languageCode);
    });
  }

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    ValueNotifier<GraphQLClient> client = ValueNotifier(
      graphQLClient,
    );

    final localeList = Globals.languageMap.values
        .map((e) => Locale(e.languageCode, e.countryCode));

    final initialRoute = _getLocalData(ref);
    return GraphQLProvider(
        client: client,
        child: MaterialApp(
          title: '小白客服',
          theme: ThemeData(
            // This is the theme of your application.
            //
            // Try running your application with "flutter run". You'll see the
            // application has a blue toolbar. Then, without quitting the app, try
            // changing the primarySwatch below to Colors.green and then invoke
            // "hot reload" (press "r" in the console where you ran "flutter run",
            // or simply save your changes to "hot reload" in a Flutter IDE).
            // Notice that the counter didn't reset back to zero; the application
            // is not restarted.
            primarySwatch: Colors.blue,
          ),
          initialRoute: initialRoute,
          routes: {
            '/home': (context) => const XBCSHomeContainer(),
            '/login': (context) => const XBCSLogin(),
            '/chat': (context) => const ChatterPageContainer(),
          },
          // home: const MyHomePage(title: 'Flutter Demo Home Page'),
          locale: _locale,
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          // or
          // localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: localeList,
          // or
          // supportedLocales: AppLocalizations.supportedLocales,
        ));
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      // This call to setState tells the Flutter framework that something has
      // changed in this State, which causes it to rerun the build method below
      // so that the display can reflect the updated values. If we changed
      // _counter without calling setState(), then the build method would not be
      // called again, and so nothing would appear to happen.
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    // This method is rerun every time setState is called, for instance as done
    // by the _incrementCounter method above.
    //
    // The Flutter framework has been optimized to make rerunning build methods
    // fast, so that you can just rebuild anything that needs updating rather
    // than having to individually change instances of widgets.
    return Scaffold(
      appBar: AppBar(
        // Here we take the value from the MyHomePage object that was created by
        // the App.build method, and use it to set our appbar title.
        title: Text(widget.title),
      ),
      body: Center(
        // Center is a layout widget. It takes a single child and positions it
        // in the middle of the parent.
        child: Column(
          // Column is also a layout widget. It takes a list of children and
          // arranges them vertically. By default, it sizes itself to fit its
          // children horizontally, and tries to be as tall as its parent.
          //
          // Invoke "debug painting" (press "p" in the console, choose the
          // "Toggle Debug Paint" action from the Flutter Inspector in Android
          // Studio, or the "Toggle Debug Paint" command in Visual Studio Code)
          // to see the wireframe for each widget.
          //
          // Column has various properties to control how it sizes itself and
          // how it positions its children. Here we use mainAxisAlignment to
          // center the children vertically; the main axis here is the vertical
          // axis because Columns are vertical (the cross axis would be
          // horizontal).
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Text(
              'You have pushed the button this many times:',
            ),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.headline4,
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: const Icon(Icons.add),
      ), // This trailing comma makes auto-formatting nicer for build methods.
    );
  }
}
