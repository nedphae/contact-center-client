import 'dart:convert';

import 'package:contact_moblie_client/model/staff.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:graphql_flutter/graphql_flutter.dart';

const serverIp = 'http://192.168.50.13:8080'; //'https://im.xbcs.top';

final HttpLink httpLink = HttpLink(
  '$serverIp/graphql',
);

final AuthLink authLink = AuthLink(
  getToken: () async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt.token');
    if (token != null) {
      final jwtMap = jsonDecode(token) as Map<String, dynamic>;
      try {
        // 读取 JWT 并添加到 状态容器
        final jwt = OauthToken.fromJson(jwtMap);
        return 'Bearer ${jwt.accessToken}';
      } catch (_) {}
    }
    return null;
  },
  // OR
  // getToken: () => 'Bearer <YOUR_PERSONAL_ACCESS_TOKEN>',
);

final Link link = authLink.concat(httpLink);
final graphQLClient = GraphQLClient(
  link: link,
  // The default store is the InMemoryStore, which does NOT persist to disk
  cache: GraphQLCache(store: HiveStore()),
);
