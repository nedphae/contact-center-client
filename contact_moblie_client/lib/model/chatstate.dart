import 'conversation.dart';

class ChatState {
  int? chattingUserId;
  Map<int, Session> sessionMap;

  ChatState({
    this.chattingUserId,
    this.sessionMap = const {},
  });

  ChatState cloneWith({
    int? chattingUserId,
    Map<int, Session>? sessionMap,
  }) =>
      ChatState(
        chattingUserId: chattingUserId ?? this.chattingUserId,
        sessionMap: sessionMap ?? this.sessionMap,
      );
}
