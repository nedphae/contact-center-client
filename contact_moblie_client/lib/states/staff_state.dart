import 'package:contact_moblie_client/model/conversation.dart';
import 'package:contact_moblie_client/model/message.dart';
import 'package:contact_moblie_client/model/staff.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

final staffProvider = StateNotifierProvider<StaffState, Staff?>((ref) {
  return StaffState(null);
});

class StaffState extends StateNotifier<Staff?> {
  StaffState(Staff? staff) : super(staff);

  void setLoginStaff({required Staff staff}) {
    state = staff;
  }
}

final jwtProvider = StateNotifierProvider<OauthState, OauthToken?>((ref) {
  return OauthState(null);
});

class OauthState extends StateNotifier<OauthToken?> {
  OauthState(OauthToken? oauth) : super(oauth);

  void setJwt({required OauthToken oauth}) {
    state = oauth;
  }
}

final sessionProvider =
    StateNotifierProvider<SessionMapState, Map<int, Session>>((ref) {
  return SessionMapState({});
});

final autoDisposeSessionProvider =
    Provider.autoDispose.family<Session?, int>((ref, userId) {
  return ref.watch(sessionProvider)[userId];
});

class SessionMapState extends StateNotifier<Map<int, Session>> {
  SessionMapState(Map<int, Session> sessionMap) : super(sessionMap);

  void addConv({required Session session}) {
    state = {...state, session.conversation.userId: session};
  }

  void hideConv(int userId) {
    state[userId]?.hide = true;
    state = {...state};
  }

  void unhideConv(int userId) {
    final session = state[userId];
    if (session != null && session.hide) {
      session.hide = false;
    }
    state = {...state};
  }

  void addHistoryMessage(Map<int, List<Message>> userMessages) {
    for (var element in userMessages.entries) {
      final userId = element.key;
      final messageList = element.value;
      var session = state[userId];
      if (session != null) {
        session.messageList = [...?session.messageList, ...messageList];
        session = session.clone;
        state[userId] = session;
      }
    }
    state = {...state};
  }

  void newMessage(Map<int, Message> userMessage) {
    for (var element in userMessage.entries) {
      final userId = element.key;
      final message = element.value;
      var session = state[userId];
      if (session != null) {
        session.messageList = [...?session.messageList, message];
        session.lastMessage = message;
        if (!session.chatting) {
          session.unread += 1;
        }
        state[userId] = session.clone;
      }
    }
    state = {...state};
  }

  void setChatting(int userId, {bool chatting = true}) {
    final session = state[userId];
    if (session != null && session.chatting != chatting) {
      session.chatting = chatting;
      session.unread = 0;
      state = {...state};
    }
  }

  void updateMessageSeqId(int userId, String uuid, int seqId, double createdAt) {
    final session = state[userId];
    if (session != null && session.messageList != null) {
      final msg =
          session.messageList?.firstWhere((element) => element.uuid == uuid);
      if (msg != null) {
        msg.seqId = seqId;
        msg.createdAt = createdAt;
      }
      state = {...state};
    }
  }
}
