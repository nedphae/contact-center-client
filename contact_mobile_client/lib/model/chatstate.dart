import 'package:contact_mobile_client/model/transfer_message.dart';

import 'conversation.dart';

class ChatState {
  int? chattingUserId;
  Map<int, Session> sessionMap;
  List<TransferQuery> transferQueryList;

  ChatState({
    this.chattingUserId,
    this.sessionMap = const {},
    this.transferQueryList = const [],
  });

  ChatState cloneWith({
    int? chattingUserId,
    Map<int, Session>? sessionMap,
    List<TransferQuery>? transferQueryList,
  }) =>
      ChatState(
        chattingUserId: chattingUserId ?? this.chattingUserId,
        sessionMap: sessionMap ?? this.sessionMap,
        transferQueryList: transferQueryList ?? this.transferQueryList,
      );
}
