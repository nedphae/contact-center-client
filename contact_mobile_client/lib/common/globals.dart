import 'package:shared_preferences/shared_preferences.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class LanguageInfo {
  String languageCode;
  String countryCode;
  String displayName;

  LanguageInfo({
    required this.languageCode,
    required this.countryCode,
    required this.displayName,
  });
}

class Globals {
  static late int orgId;
  static IO.Socket? socket;
  static late SharedPreferences prefs;
  static const prefsOauthToken = 'jwt.token';
  static const prefsAccessToken = 'jwt.token.accessToken';
  static const language = 'language';
  static final Map<String, LanguageInfo> languageMap = {
    'zh':
        LanguageInfo(languageCode: 'zh', countryCode: '', displayName: '简体中文'),
    'en': LanguageInfo(
        languageCode: 'en', countryCode: '', displayName: 'English'),
  };
}
