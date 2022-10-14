import 'package:http/http.dart' as http;
import 'package:contact_mobile_client/common/config.dart';
import 'package:contact_mobile_client/common/globals.dart';
import 'package:contact_mobile_client/model/staff.dart';
import 'package:jwt_decode/jwt_decode.dart';
import 'dart:convert';

clearToken() {
  Globals.prefs.remove(Globals.prefsAccessToken);
  Globals.prefs.remove(Globals.prefsOauthToken);
  graphQLClient.cache.store.reset();
}

Future<String?> getAccessToken() async {
  var accessToken = Globals.prefs.getString(Globals.prefsAccessToken);
  if (accessToken != null) {
    DateTime? expiryDate = Jwt.getExpiryDate(accessToken);
    if (expiryDate?.isBefore(DateTime.now().add(const Duration(minutes: 5))) ??
        false) {
      final oauthToken = await refreshToken();
      if (oauthToken != null) {
        accessToken = oauthToken.accessToken;
        return accessToken;
      }
    } else {
      return accessToken;
    }
  }
  return null;
}

Future<OauthToken?> refreshToken({String? tempRefreshToken}) async {
  String credentials = "Xsrr8fXfGJ:K&wroZ4M6z4@a!W62q\$*Dks";
  Codec<String, String> stringToBase64 = utf8.fuse(base64);
  String encoder = stringToBase64.encoder.convert(credentials);

  var refreshToken = tempRefreshToken;
  int? oid;
  if (refreshToken == null) {
    final token = Globals.prefs.getString(Globals.prefsOauthToken);
    if (token != null) {
      final jwtMap = jsonDecode(token) as Map<String, dynamic>;
      final jwt = OauthToken.fromJson(jwtMap);

      refreshToken = jwt.refreshToken;
      oid = jwt.oid;
    }
  }
  if (refreshToken != null) {
    final oauthParam = {
      'grant_type': 'refresh_token',
      'refresh_token': refreshToken,
      'org_id': oid,
    };
    String url = "$serverIp/oauth/token?${encode(oauthParam)}";
    var res = await http.post(Uri.parse(url), headers: <String, String>{
      'Authorization': "Basic $encoder",
    });
    if (res.statusCode == 200) {
      final parsed = jsonDecode(res.body) as Map<String, dynamic>;
      final oauthToken = OauthToken.fromJson(parsed);
      Globals.prefs.setString(Globals.prefsOauthToken, jsonEncode(oauthToken));
      Globals.prefs.setString(Globals.prefsAccessToken, oauthToken.accessToken);
      return oauthToken;
    }
  }
  return null;
}
