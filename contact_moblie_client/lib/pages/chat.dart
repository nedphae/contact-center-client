import 'package:contact_mobile_client/common/config.dart';
import 'package:contact_mobile_client/common/globals.dart';
import 'package:contact_mobile_client/model/conversation.dart';
import 'package:contact_mobile_client/model/customer.dart';
import 'package:contact_mobile_client/model/message.dart';
import 'package:contact_mobile_client/model/staff.dart';
import 'package:contact_mobile_client/model/constants.dart';
import 'package:contact_mobile_client/model/web_socket_request.dart';
import 'package:contact_mobile_client/states/state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

class ChatterScreen extends StatefulHookConsumerWidget {
  const ChatterScreen({super.key});

  @override
  ChatterScreenState createState() => ChatterScreenState();
}

class ChatterScreenState extends ConsumerState<ChatterScreen> {
  final chatMsgTextController = TextEditingController();
  Staff? _currentStaff;
  late Session _currentSession;
  late Customer _customer;
  String? messageText;
  // void getMessages()async{
  //   final messages=await _firestore.collection('messages').getDocuments();
  //   for(var message in messages.documents){
  //     print(message.data);
  //   }
  // }

  // void messageStream() async {
  //   await for (var snapshot in _firestore.collection('messages').snapshots()) {
  //     snapshot.documents;
  //   }
  // }

  sendTextMessage() {
    if (messageText != null && messageText!.isNotEmpty) {
      final content = Content(
          contentType: "TEXT", textContent: TextContent(text: messageText!));
      final message = Message(
          uuid: uuid.v4(),
          to: _customer.id,
          type: CreatorType.customer,
          creatorType: CreatorType.staff,
          content: content);
      // 使用 websocket 发送消息
      final messageMap = message.toJson();
      messageMap.removeWhere((key, value) => value == null);

      final request = WebSocketRequest.generateRequest(messageMap);
      ref.read(chatStateProvider.notifier).newMessage({_customer.id: message});
      Globals.socket?.emitWithAck('msg/send', request, ack: (data) {
        final response = WebSocketResponse.fromJson(data);
        final body = response.body as Map<String, dynamic>;
        ref.read(chatStateProvider.notifier).updateMessageSeqId(
            _customer.id, message.uuid, body['seqId'], body['createdAt']);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    _currentStaff = ref.watch(staffProvider);
    final args =
        ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    final selectUserId = args['selectUserId'] as int;
    final selectSession = ref.watch(
        chatStateProvider.select((value) => value.sessionMap[selectUserId]));

    final sessionMsgList = selectSession?.messageList;
    final topMsgId =
        sessionMsgList?.isNotEmpty ?? false ? sessionMsgList?.last.seqId : null;

    final historyMessageResult = useQuery(QueryOptions(
      document: gql(Message.loadHistoryMsg),
      variables: {'userId': selectUserId, 'cursor': topMsgId, 'limit': 20},
    ));

    List<Message> messageList = [];

    if (selectSession != null) {
      _currentSession = selectSession;
      _customer = selectSession.customer;

      if (_currentSession.shouldSync) {
        Future.delayed(const Duration(seconds: 1), () {
          historyMessageResult.refetch();
          ref
              .read(chatStateProvider.notifier)
              .setShouldSync(userId: _currentSession.conversation.userId);
        });
      }

      final messageListMap =
          historyMessageResult.result.data?['loadHistoryMessage'];
      if (messageListMap != null) {
        final messagePage = PageResult.fromJson(messageListMap);
        final historyMsgList =
            messagePage.content.map((e) => Message.fromJson(e)).toList();
        messageList.addAll(historyMsgList);
      }
      messageList.addAll(_currentSession.messageList ?? []);
    } else {
      Future.delayed(const Duration(seconds: 1), () {
        if (!mounted) return;
        Navigator.of(context).pushNamed('/home');
      });
    }

    int? fetchMoreCursor;

    if (messageList.isNotEmpty) {
      // 去重
      messageList = messageList
          .map((e) => {e.uuid: e})
          .reduce((value, element) {
            value.addAll(element);
            return value;
          })
          .values
          .toList();

      messageList.sort((a, b) =>
          (b.seqId ?? 0x7fffffffffffffff) - (a.seqId ?? 0x7fffffffffffffff));
      fetchMoreCursor = messageList.last.seqId;
    }

    FetchMoreOptions opts = FetchMoreOptions(
      variables: {
        'userId': selectUserId,
        'cursor': fetchMoreCursor,
        'limit': 20
      },
      updateQuery: (previousResultData, fetchMoreResultData) {
        // this function will be called so as to combine both the original and fetchMore results
        // it allows you to combine them as you would like
        final List<dynamic> repos = [
          ...previousResultData?['loadHistoryMessage']['content']
              as List<dynamic>,
          ...?fetchMoreResultData?['loadHistoryMessage']['content']
              as List<dynamic>?,
        ];

        // to avoid a lot of work, lets just update the list of repos in returned
        // data with new data, this also ensures we have the endCursor already set
        // correctly
        fetchMoreResultData?['loadHistoryMessage']['content'] = repos;

        return fetchMoreResultData;
      },
    );

    return WillPopScope(
      onWillPop: () => Future.sync(() {
        if (!mounted) return false;
        ref.read(chatStateProvider.notifier).clearChattingUser();
        return true;
      }),
      child: Scaffold(
        // AppBar 会自动提供回退按钮 可通过 automaticallyImplyLeading 修改
        appBar: AppBar(
          iconTheme: const IconThemeData(color: Colors.deepPurple),
          elevation: 0,
          bottom: PreferredSize(
            preferredSize: const Size(25, 10),
            child: Container(
              decoration: const BoxDecoration(
                  // color: Colors.blue,
                  // borderRadius: BorderRadius.circular(20)
                  ),
              constraints: const BoxConstraints.expand(height: 1),
              child: LinearProgressIndicator(
                valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                backgroundColor: Colors.blue[100],
              ),
            ),
          ),
          backgroundColor: Colors.white10,
          // leading: Padding(
          //   padding: const EdgeInsets.all(12.0),
          //   child: CircleAvatar(backgroundImage: NetworkImage('https://cdn.clipart.email/93ce84c4f719bd9a234fb92ab331bec4_frisco-specialty-clinic-vail-health_480-480.png'),),
          // ),
          title: Row(
            children: <Widget>[
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    _currentSession.customer.name,
                    style: const TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 16,
                        color: Colors.deepPurple),
                  ),
                  Text(_currentSession.customer.uid,
                      style: const TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 8,
                          color: Colors.deepPurple))
                ],
              ),
            ],
          ),
          actions: <Widget>[
            GestureDetector(
              child: PopupMenuButton<Text>(
                itemBuilder: (context) {
                  return [
                    PopupMenuItem(
                      onTap: () {},
                      child: const Text(
                        '历史会话',
                      ),
                    ),
                    PopupMenuItem(
                      onTap: () {},
                      child: const Text(
                        '用户信息',
                      ),
                    ),
                    PopupMenuItem(
                      onTap: () {
                        ref
                            .read(chatStateProvider.notifier)
                            .hideConv(_customer.id);
                        Navigator.pop(context);
                      },
                      child: const Text(
                        '关闭会话',
                      ),
                    ),
                  ];
                },
              ),
            )
          ],
        ),
        body: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            ChatStream(
              messageaList: messageList,
              staff: _currentStaff!,
              customer: _currentSession.customer,
              onRefresh: () {
                return historyMessageResult.fetchMore(opts);
              },
            ),
            Container(
              padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 10),
              decoration: kMessageContainerDecoration,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: <Widget>[
                  Expanded(
                    child: Material(
                      borderRadius: BorderRadius.circular(50),
                      color: Colors.white,
                      elevation: 5,
                      child: Padding(
                        padding:
                            const EdgeInsets.only(left: 8.0, top: 2, bottom: 2),
                        child: TextField(
                          onChanged: (value) {
                            setState(() {
                              messageText = value;
                            });
                          },
                          controller: chatMsgTextController,
                          decoration: kMessageTextFieldDecoration,
                        ),
                      ),
                    ),
                  ),
                  MaterialButton(
                      shape: const CircleBorder(),
                      color: Colors.blue,
                      onPressed:
                          (messageText != null && messageText!.isNotEmpty)
                              ? () {
                                  chatMsgTextController.clear();
                                  sendTextMessage();
                                  setState(() {
                                    messageText = null;
                                  });
                                }
                              : null,
                      child: const Padding(
                        padding: EdgeInsets.all(10.0),
                        child: Icon(
                          Icons.send,
                          color: Colors.white,
                        ),
                      )
                      // Text(
                      //   'Send',
                      //   style: kSendButtonTextStyle,
                      // ),
                      ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ChatStream extends StatelessWidget {
  final List<Message> messageaList;
  final Staff staff;
  final Customer customer;
  final Future<void> Function() onRefresh;

  const ChatStream(
      {super.key,
      required this.messageaList,
      required this.staff,
      required this.customer,
      required this.onRefresh});

  @override
  Widget build(BuildContext context) {
    List<MessageBubble> messageWidgets = [];

    final messageaList = this.messageaList;

    if (messageaList.isNotEmpty) {
      for (var message in messageaList) {
        final isStaff = message.creatorType == CreatorType.staff;
        final msgBubble = MessageBubble(
          msgSender: isStaff ? staff.nickName : customer.name,
          staff: isStaff,
          message: message,
        );
        messageWidgets.add(msgBubble);
      }

      return Expanded(
        child: RefreshIndicator(
          onRefresh: onRefresh,
          child: ListView(
            reverse: true,
            padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 10),
            children: messageWidgets,
          ),
        ),
      );
    } else {
      return const Center(
        child: CircularProgressIndicator(backgroundColor: Colors.deepPurple),
      );
    }
  }
}

class MessageBubble extends StatelessWidget {
  final String msgSender;
  final bool staff;
  final Message message;

  const MessageBubble(
      {super.key,
      required this.msgSender,
      required this.staff,
      required this.message});

  Widget createBubble(Message message) {
    Widget result = Text(
      '不支持的消息类型',
      style: TextStyle(
        color: staff ? Colors.white : Colors.blue,
        fontFamily: 'Poppins',
        fontSize: 15,
      ),
    );
    final content = message.content;
    switch (message.content.contentType) {
      case 'TEXT':
        result = Text(
          content.textContent?.text ?? '',
          style: TextStyle(
            color: staff ? Colors.white : Colors.blue,
            fontFamily: 'Poppins',
            fontSize: 15,
          ),
        );
        break;
      case 'IMAGE':
        final imageUrl = "$serverIp${content.photoContent?.mediaId}";
        result = Image.network(
          imageUrl,
          loadingBuilder: (context, child, loadingProgress) {
            if (loadingProgress == null) return child;
            return Container(
              decoration: const BoxDecoration(
                color: Color(0xffE8E8E8),
                borderRadius: BorderRadius.all(
                  Radius.circular(8),
                ),
              ),
              width: 200,
              height: 200,
              child: Center(
                child: CircularProgressIndicator(
                  color: const Color(0xfff5a623),
                  value: loadingProgress.expectedTotalBytes != null
                      ? loadingProgress.cumulativeBytesLoaded /
                          loadingProgress.expectedTotalBytes!
                      : null,
                ),
              ),
            );
          },
          errorBuilder: (context, object, stackTrace) {
            return Material(
              borderRadius: const BorderRadius.all(
                Radius.circular(8),
              ),
              clipBehavior: Clip.hardEdge,
              child: Image.asset(
                'images/img_not_available.jpeg',
                width: 200,
                height: 200,
                fit: BoxFit.cover,
              ),
            );
          },
          width: 200,
          height: 200,
          fit: BoxFit.cover,
        );
        break;
      case 'RICH_TEXT':
        final htmlText = content.textContent?.text;
        if (htmlText != null) {
          result = Html(
            data: htmlText,
            onLinkTap: (String? url, RenderContext context,
                Map<String, String> attributes, dynamic element) async {
              if (url != null && await canLaunchUrl(Uri.parse(url))) {
                await launchUrl(Uri.parse(url));
              } else {
                throw 'Could not launch $url';
              }
            },
          );
        }
        break;
      default:
        break;
    }
    return result;
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(12.0),
      child: Column(
        crossAxisAlignment:
            staff ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: <Widget>[
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: Text(
              msgSender,
              style: const TextStyle(
                  fontSize: 13, fontFamily: 'Poppins', color: Colors.black87),
            ),
          ),
          Material(
            borderRadius: BorderRadius.only(
              bottomLeft: const Radius.circular(50),
              topLeft:
                  staff ? const Radius.circular(50) : const Radius.circular(0),
              bottomRight: const Radius.circular(50),
              topRight:
                  staff ? const Radius.circular(0) : const Radius.circular(50),
            ),
            color: staff ? Colors.green : Colors.white,
            elevation: 5,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 20),
              child: createBubble(message),
            ),
          ),
        ],
      ),
    );
  }
}
