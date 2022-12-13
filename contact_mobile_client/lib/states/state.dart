import 'package:contact_mobile_client/model/chatstate.dart';
import 'package:contact_mobile_client/model/conversation.dart';
import 'package:contact_mobile_client/model/message.dart';
import 'package:contact_mobile_client/model/staff.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../common/config.dart';
import '../model/customer.dart';
import '../model/transfer_message.dart';

final staffProvider = StateNotifierProvider<StaffState, Staff?>((ref) {
  return StaffState(null);
});

class StaffState extends StateNotifier<Staff?> {
  StaffState(Staff? staff) : super(staff);

  void setLoginStaff({required Staff staff}) {
    state = staff;
  }

  void addStaffStatus({required StaffStatus staffStatus}) {
    final newState = state?.cloneWith(staffStatus: staffStatus);
    state = newState;
  }

  void updateConnectedStatus(bool connected) {
    final newState = state?.cloneWith(connected: connected);
    state = newState;
  }
}

final chatStateProvider =
    StateNotifierProvider<ChatStateState, ChatState>((ref) {
  return ChatStateState(ChatState());
});

class ChatStateState extends StateNotifier<ChatState> {
  ChatStateState(ChatState chatState) : super(chatState);

  void setChattingUser(int userId) {
    var sessionMap = state.sessionMap;
    final session = sessionMap[userId];
    if (session != null &&
        session.conversation.userId != state.chattingUserId) {
      session.unread = 0;
      sessionMap = {...sessionMap};
      state = state.cloneWith(chattingUserId: userId, sessionMap: sessionMap);
    }
  }

  void clearChattingUser() {
    if (state.chattingUserId != null) {
      state.chattingUserId = null;
      state = state.cloneWith();
    }
  }

  void addConv({required Session session}) {
    var sessionMap = state.sessionMap;
    var tempSession = sessionMap[session.conversation.userId];
    if (tempSession == null) {
      sessionMap = {...sessionMap, session.conversation.userId: session};
    } else {
      tempSession = tempSession.cloneWith(
          conversation: session.conversation,
          customer: session.customer,
          shouldSync: true);
      tempSession.messageList = null;
      sessionMap.remove(session.conversation.userId);
      sessionMap = {
        session.conversation.userId: tempSession,
        ...sessionMap,
      };
    }
    state = state.cloneWith(sessionMap: sessionMap);
  }

  void updateCustomer(Customer customer) {
    var sessionMap = state.sessionMap;
    final customerStatus = sessionMap[customer.id]?.customer.status;
    customer.status = customerStatus;
    sessionMap[customer.id]?.customer = customer;
    sessionMap = {...sessionMap};
    state = state.cloneWith(sessionMap: sessionMap);
  }

  void setShouldSync({required int userId, shouldSync = false}) {
    var sessionMap = state.sessionMap;
    sessionMap[userId]?.shouldSync = shouldSync;
    sessionMap = {...sessionMap};
    state = state.cloneWith(sessionMap: sessionMap);
  }

  void setStaffDraft(int userId, String? staffDraft) {
    var sessionMap = state.sessionMap;
    sessionMap[userId]?.staffDraft = staffDraft;
    sessionMap = {...sessionMap};
    state = state.cloneWith(sessionMap: sessionMap);
  }

  void hideConv(int userId) {
    var sessionMap = state.sessionMap;
    sessionMap[userId]?.hide = true;
    sessionMap = {...sessionMap};
    state = state.cloneWith(sessionMap: sessionMap);
  }

  void unhideConv(int userId) {
    var sessionMap = state.sessionMap;
    final session = sessionMap[userId];
    if (session != null) {
      _unHideSession(session);

      sessionMap[userId] = session.cloneWith();
    }
    sessionMap = {...sessionMap};
    state = state.cloneWith(sessionMap: sessionMap);
  }

  void _unHideSession(Session session) {
    if (session.hide) {
      session.hide = false;
    }
  }

  void addHistoryMessage(Map<int, List<Message>> userMessages) {
    var sessionMap = state.sessionMap;
    for (var element in userMessages.entries) {
      final userId = element.key;
      final messageList = element.value;
      var session = sessionMap[userId];
      if (session != null) {
        session.messageList = [...?session.messageList, ...messageList];

        sessionMap[userId] = session.cloneWith();
      }
    }
    sessionMap = {...sessionMap};
    state = state.cloneWith(sessionMap: sessionMap);
  }

  void newMessage(Map<int, Message> userMessage) {
    var sessionMap = state.sessionMap;
    for (var element in userMessage.entries) {
      final userId = element.key;
      final message = element.value;
      var session = sessionMap[userId];
      if (session != null) {
        session.messageList = [...?session.messageList, message];
        session.lastMessage = message;
        if (state.chattingUserId != session.conversation.userId) {
          session.unread += 1;
        }
        _unHideSession(session);

        sessionMap[userId] = session.cloneWith();
      }
    }
    sessionMap = {...sessionMap};
    state = state.cloneWith(sessionMap: sessionMap);
  }

  void updateMessageSeqId(
      int userId, String uuid, int seqId, double createdAt) {
    var sessionMap = state.sessionMap;
    var session = sessionMap[userId];
    if (session != null && session.messageList != null) {
      final msg =
          session.messageList?.firstWhere((element) => element.uuid == uuid);
      if (msg != null) {
        msg.seqId = seqId;
        msg.createdAt = createdAt;
      }

      sessionMap[userId] = session.cloneWith();
      sessionMap = {...sessionMap};
      state = state.cloneWith(sessionMap: sessionMap);
    }
  }

  void deleteMessage(int userId, String uuid, Message showMessage) {
    var sessionMap = state.sessionMap;
    final session = sessionMap[userId];
    if (session != null && session.messageList != null) {
      session.messageList?.removeWhere((element) => element.uuid == uuid);
      session.messageList = [...?session.messageList, showMessage];
      session.lastMessage = showMessage;

      sessionMap[userId] = session.cloneWith();
      sessionMap = {...sessionMap};
      state = state.cloneWith(sessionMap: sessionMap);
    }
  }

  void addTransferQuery(TransferQuery transferQuery) {
    state.transferQueryList.add(transferQuery);
    state = state.cloneWith(transferQueryList: state.transferQueryList);
  }

  void updateConv(Conversation conv) {
    var sessionMap = state.sessionMap;
    sessionMap[conv.userId]?.conversation = conv;
    sessionMap = {...sessionMap};
    state = state.cloneWith(sessionMap: sessionMap);
  }
}

final mutationConvTransferProvider =
    FutureProvider.family<ConversationView?, TransferQuery>(
        (ref, transferQuery) async {
  final response = await graphQLClient.mutate(MutationOptions(
      document: gql(TransferQuery.mutationConvTransfer),
      variables: {"transferQuery": transferQuery}));
  final result = response.data?["transferTo"] as ConversationView?;
  if (result != null) {
    final updateResult = await graphQLClient.query(QueryOptions(
        document: gql(Conversation.queryConvById),
        variables: {"id": result.id}));
    final updateConv =
        updateResult.data?["getConversationById"] as Conversation?;
    if (updateConv != null) {
      ref.watch(chatStateProvider.notifier).updateConv(updateConv);
    }
  }
  return result;
});
