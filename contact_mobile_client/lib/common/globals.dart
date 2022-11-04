import 'package:shared_preferences/shared_preferences.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class Globals {
  static late int orgId;
  static IO.Socket? socket;
  static late SharedPreferences prefs;
  static const prefsOauthToken = 'jwt.token';
  static const prefsAccessToken = 'jwt.token.accessToken';
}
