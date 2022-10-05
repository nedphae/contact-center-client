
import 'package:contact_moblie_client/model/conversation.dart';
import 'package:contact_moblie_client/model/staff.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

final staffProvider = StateNotifierProvider<StaffState, Staff?>((ref) {
  return StaffState(null);
});

class StaffState extends StateNotifier<Staff?> {
  StaffState(Staff? staff): super(staff);

  void setLoginStaff({required Staff staff}) {
    state = staff;
  }
}

final jwtProvider = StateNotifierProvider<OauthState, OauthToken?>((ref) {
  return OauthState(null);
});

class OauthState extends StateNotifier<OauthToken?> {
  OauthState(OauthToken? oauth): super(oauth);

  void setJwt({required OauthToken oauth}) {
    state = oauth;
  }
}

final sessionProvider = StateNotifierProvider<SessionMapState, Map<int, Session>>((ref) {
  return SessionMapState({});
});

class SessionMapState extends StateNotifier<Map<int, Session>> {
  SessionMapState(Map<int, Session> sessionMap): super(sessionMap);

  void addConv({required Session session}) {
    state[session.conversation.userId] = session;
  }

  void hideConv(int userId) {
    state[userId]?.hide = true;
  }

  void unhideConv(int userId) {
    final session = state[userId];
    if (session != null && session.hide) {
      session.hide = false;
    }
  }
}
