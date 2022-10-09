import 'package:contact_moblie_client/common/token_utils.dart';
import 'package:flutter/foundation.dart';
import 'package:graphql_flutter/graphql_flutter.dart';

const serverIp =
    kDebugMode ? 'http://192.168.50.13:8080' : 'https://im.xbcs.top';

final HttpLink httpLink = HttpLink(
  '$serverIp/graphql',
);

final AuthLink authLink = AuthLink(
  getToken: () async {
    var accessToken = await getAccessToken();
    if (accessToken != null) {
      return 'Bearer $accessToken';
    }
    return null;
  },
  // OR
  // getToken: () => 'Bearer <YOUR_PERSONAL_ACCESS_TOKEN>',
);

final Link link =
    authLink.concat(httpLink); // Link.from([freshLink, httpLink]);
final graphQLClient = GraphQLClient(
  link: link,
  // The default store is the InMemoryStore, which does NOT persist to disk
  cache: GraphQLCache(store: HiveStore()),
);

String encode(Map obj) {
  var str = '';

  for (var i in obj.keys) {
    if (str.isNotEmpty) str += '&';
    str += '${Uri.encodeComponent('$i')}=${Uri.encodeComponent('${obj[i]}')}';
  }

  return str;
}
