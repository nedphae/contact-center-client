import 'dart:convert';
import 'dart:developer' as developer;
import 'dart:io';

import 'package:contact_mobile_client/common/config.dart';
import 'package:contact_mobile_client/common/globals.dart';
import 'package:contact_mobile_client/model/conversation.dart';
import 'package:contact_mobile_client/model/customer.dart';
import 'package:contact_mobile_client/model/message.dart';
import 'package:contact_mobile_client/model/staff.dart';
import 'package:contact_mobile_client/model/web_socket_request.dart';
import 'package:contact_mobile_client/states/state.dart';
import 'package:edge_alerts/edge_alerts.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:flutter_chat_ui/flutter_chat_ui.dart' as flutter_chat_ui;
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import 'package:open_filex/open_filex.dart';
import 'package:path_provider/path_provider.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:http/http.dart' as http;
import '../model/item.dart';
import '../widgets/blockuser.dart';
import '../widgets/custom_pop_up_menu.dart';
import '../widgets/transfer.dart';
import 'customer_info.dart';

// 使用 Container 把 Graphql 调用提取到父组件
class ChatterPageContainer extends HookConsumerWidget {
  const ChatterPageContainer({super.key});

  MessagePageGraphql _parserFn(Map<String, dynamic> data) {
    final messageListMap = data['loadHistoryMessage'];
    if (messageListMap != null) {
      final messagePage = PageResult.fromJson(messageListMap);
      final historyMsgList =
          messagePage.content.map((e) => Message.fromJson(e)).toList();
      messagePage.content = historyMsgList;
      return MessagePageGraphql(loadHistoryMessage: messagePage);
    }
    return MessagePageGraphql();
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectUserId =
        ref.watch(chatStateProvider.select((value) => value.chattingUserId));
    final topMsgId = ref.read(chatStateProvider.select((value) {
      final sessionMsgList =
          value.sessionMap[value.chattingUserId]?.messageList;
      return sessionMsgList?.isNotEmpty ?? false
          ? sessionMsgList?.first.seqId
          : null;
    }));

    final historyMessageResult = useQuery<MessagePageGraphql>(QueryOptions(
        document: gql(Message.loadHistoryMsg),
        variables: {'userId': selectUserId, 'cursor': topMsgId, 'limit': 20},
        parserFn: _parserFn));

    return ChatterPage(historyMessageResult: historyMessageResult);
  }
}

class ChatterPage extends StatefulHookConsumerWidget {
  final QueryHookResult<MessagePageGraphql> historyMessageResult;

  const ChatterPage({
    Key? key,
    required this.historyMessageResult,
  }) : super(key: key);

  @override
  ChatterPageState createState() => ChatterPageState();
}

class ChatterPageState extends ConsumerState<ChatterPage> {
  final chatMsgTextController = TextEditingController();
  Staff? _currentStaff;
  late Session _currentSession;
  late Customer _customer;
  String? messageText;
  List<types.Message> _messages = [];

  sendTextMessage(String text) {
    if (text.isNotEmpty) {
      final content =
          Content(contentType: "TEXT", textContent: TextContent(text: text));
      sendMessage(content);
    }
  }

  sendImageMessage(String imageUrl, XFile file) async {
    final content = Content(
        contentType: "IMAGE",
        photoContent: PhotoContent(
            mediaId: imageUrl,
            filename: file.name,
            picSize: await file.length(),
            type: 'auto'));
    sendMessage(content);
  }

  sendMessage(Content content) {
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

  @override
  Widget build(BuildContext context) {
    _currentStaff = ref.watch(staffProvider);
    // final args =
    //     ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    // final selectUserId = args['selectUserId'] as int;
    final selectUserId =
        ref.watch(chatStateProvider.select((value) => value.chattingUserId));
    final selectSession = ref.watch(chatStateProvider
        .select((value) => value.sessionMap[value.chattingUserId]));

    final graphqlResult = widget.historyMessageResult.result.parsedData;
    final messageListGraphql =
        graphqlResult?.loadHistoryMessage?.content as List<Message>? ?? [];
    List<Message> messageList = [...messageListGraphql];

    if (selectUserId != null && selectSession != null) {
      _currentSession = selectSession;
      _customer = selectSession.customer;

      final staffDraft = selectSession.staffDraft;
      if (staffDraft != null && messageText == null) {
        // 设置草稿到输入框
        chatMsgTextController.text = staffDraft;
        messageText = staffDraft;
        Future.delayed(const Duration(milliseconds: 200), () {
          ref
              .read(chatStateProvider.notifier)
              .setStaffDraft(selectUserId, null);
        });
      }

      if (_currentSession.shouldSync) {
        Future.delayed(const Duration(seconds: 1), () {
          widget.historyMessageResult.refetch();
          ref
              .read(chatStateProvider.notifier)
              .setShouldSync(userId: _currentSession.conversation.userId);
        });
      }
      messageList.addAll(_currentSession.messageList ?? []);
    } else {
      Future.delayed(const Duration(seconds: 1), () {
        if (!mounted) return;
        Navigator.of(context).pushNamed('/home');
      });
    }

    int? fetchMoreCursor;

    if (_currentStaff != null && messageList.isNotEmpty) {
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
      _messages = messageList
          .map((e) => e.toChatUIMessage(_currentStaff!, _customer))
          .toList();

      if (kDebugMode) {
        developer.log("消息长度: ${_messages.length}", name: 'chat.messageList');
      }
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
        final chatStatePN = ref.read(chatStateProvider.notifier);
        if (messageText != null &&
            messageText!.isNotEmpty &&
            selectUserId != null) {
          chatStatePN.setStaffDraft(selectUserId, messageText!);
        }
        chatStatePN.clearChattingUser();
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
              child: PopupMenuButton<String>(
                onSelected: (select) {
                  switch (select) {
                    case 'user':
                      // Navigator.pop(context);
                      Navigator.of(context).push(MaterialPageRoute(
                        builder: (context) => CustomerInfo(selectUserId!),
                        // builder: (context) => XBCSLogin(),
                      ));
                      break;
                    case 'blockUser':
                      showCupertinoModalBottomSheet(
                        expand: true,
                        context: context,
                        backgroundColor: Colors.transparent,
                        builder: (context) => const BlockUserBottomSheet(),
                      );
                      break;
                    case 'transfer':
                      showCupertinoModalBottomSheet(
                        expand: true,
                        context: context,
                        backgroundColor: Colors.transparent,
                        builder: (context) => const TransferModalWithPageView(),
                      );
                      break;
                    default:
                      break;
                  }
                },
                itemBuilder: (context) {
                  return [
                    // 拉黑客户
                    PopupMenuItem(
                      value: 'blockUser',
                      child: Text(
                        AppLocalizations.of(context)!.blockUser,
                      ),
                    ),
                    // 转接客户
                    PopupMenuItem(
                      value: 'transfer',
                      child: Text(
                        AppLocalizations.of(context)!.transfer,
                      ),
                    ),
                    // 客户信息
                    PopupMenuItem(
                      // 无法使用 onTap 进行 Navigator 跳转
                      // 因为 PopupMenuButton 的 showMenu 使用 navigator.of
                      value: 'user',
                      child: Text(
                        AppLocalizations.of(context)!.userInformation,
                      ),
                    ),
                    // 关闭会话
                    PopupMenuItem(
                      onTap: () {
                        ref
                            .read(chatStateProvider.notifier)
                            .hideConv(_customer.id);
                        Navigator.pop(context);
                      },
                      child: Text(
                        AppLocalizations.of(context)!.closeTheSession,
                      ),
                    ),
                  ];
                },
              ),
            )
          ],
        ),
        body: flutter_chat_ui.Chat(
          l10n: flutter_chat_ui.ChatL10nEn(
            attachmentButtonAccessibilityLabel: AppLocalizations.of(context)!
                .attachmentButtonAccessibilityLabel,
            emptyChatPlaceholder:
                AppLocalizations.of(context)!.emptyChatPlaceholder,
            fileButtonAccessibilityLabel:
                AppLocalizations.of(context)!.fileButtonAccessibilityLabel,
            inputPlaceholder: '',
            sendButtonAccessibilityLabel:
                AppLocalizations.of(context)!.sendButtonAccessibilityLabel,
            unreadMessagesLabel:
                AppLocalizations.of(context)!.unreadMessagesLabel,
          ),
          messages: _messages,
          customMessageBuilder: _customMessageBuilder,
          onEndReached: () {
            return widget.historyMessageResult.fetchMore(opts);
          },
          onAttachmentPressed: _handleAttachmentPressed,
          onMessageTap: _handleMessageTap,
          textMessageOptions:
              const flutter_chat_ui.TextMessageOptions(isTextSelectable: false),
          onMessageLongPress: _handleMessageLongPress,
          // 先不获取网页的预览
          // onPreviewDataFetched: _handlePreviewDataFetched,
          onSendPressed: _handleSendPressed,
          showUserAvatars: true,
          showUserNames: true,
          user: types.User(id: _currentStaff?.id.toString() ?? "unknown"),
        ),
      ),
    );
  }

  Widget _customMessageBuilder(types.CustomMessage customMessage,
      {required int messageWidth}) {
    // 检查是否是富文本
    final htmlText = customMessage.metadata?["RICH_TEXT"];
    if (htmlText != null) {
      return Html(
        data: htmlText,
        onLinkTap: (String? url, RenderContext context,
            Map<String, String> attributes, dynamic element) async {
          if (url != null && await canLaunchUrl(Uri.parse(url))) {
            await launchUrl(Uri.parse(url));
          } else {
            // throw 'Could not launch $url';
          }
        },
      );
    }
    return Text("[${AppLocalizations.of(context)!.messageTypeRichText}]");
  }

  void _handleAttachmentPressed() {
    showModalBottomSheet<void>(
      context: context,
      builder: (BuildContext context) => SafeArea(
        child: SizedBox(
          height: 144,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  _handleImageSelection();
                },
                child: Align(
                  alignment: AlignmentDirectional.centerStart,
                  child: Text(AppLocalizations.of(context)!.messageTypeImage),
                ),
              ),
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  _handleFileSelection();
                },
                child: Align(
                  alignment: AlignmentDirectional.centerStart,
                  child: Text(AppLocalizations.of(context)!.messageTypeFile),
                ),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Align(
                  alignment: AlignmentDirectional.centerStart,
                  child: Text(AppLocalizations.of(context)!.cancel),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _handleFileSelection() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.any,
    );

    // if (result != null && result.files.single.path != null) {
    //   final message = types.FileMessage(
    //     author: _user,
    //     createdAt: DateTime.now().millisecondsSinceEpoch,
    //     id: const Uuid().v4(),
    //     mimeType: lookupMimeType(result.files.single.path!),
    //     name: result.files.single.name,
    //     size: result.files.single.size,
    //     uri: result.files.single.path!,
    //   );
    //
    //   _addMessage(message);
    // }
  }

  void _handleImageSelection() async {
    final XFile? image = await ImagePicker().pickImage(
      source: ImageSource.gallery,
    );

    if (image != null) {
      String url = "$serverIp/s3/chat/${Globals.orgId}";
      final request = http.MultipartRequest('POST', Uri.parse(url));
      final filePart = await http.MultipartFile.fromPath('file', image.path);
      request.files.add(filePart);
      http.Response response =
          await http.Response.fromStream(await request.send());
      if (response.statusCode == 200) {
        final imageUrl = jsonDecode(response.body) as List<dynamic>;
        sendImageMessage(imageUrl[0], image);
      } else {
        if (!mounted) return;
        edgeAlert(context,
            title: AppLocalizations.of(context)!.failedToUploadImage,
            description: AppLocalizations.of(context)!
                .thereIsAProblemWithTheRemoteServerPleaseTryAgainLater,
            gravity: Gravity.bottom,
            icon: Icons.error,
            duration: 5,
            backgroundColor: Colors.redAccent);
      }
    }
  }

  void _handleSendPressed(types.PartialText message) {
    sendTextMessage(message.text);
  }

  void _handleMessageLongPress(BuildContext context, types.Message message) {
    CustomPopupMenuController controller = CustomPopupMenuController();
    final metadata = message.metadata!;
    final uuid = metadata["uuid"];
    final seqId = metadata["seqId"];
    final to = metadata["to"];
    List<ItemModel> menuItems = [
      // ItemModel(title: '复制', icon: Icons.content_copy),
      // ItemModel(title: '转发', icon: Icons.send),
      // ItemModel(title: '收藏', icon: Icons.collections),
      // ItemModel(title: '删除', icon: Icons.delete),
      ItemModel(
          title: '撤回',
          icon: Icons.undo,
          onTap: () {
            // 撤回消息
            final content = Content(
                contentType: 'SYS',
                sysCode: 'WITHDRAW',
                serviceContent: const JsonEncoder().convert({
                  'uuid': uuid,
                  'seqId': seqId,
                }));
            final withDrawMessage = Message(
              uuid: uuid.v4(),
              to: to,
              type: CreatorType.customer,
              creatorType: CreatorType.sys,
              createdAt: message.createdAt! / 1000,
              content: content,
            );
            final messageMap = withDrawMessage.toJson();
            messageMap.removeWhere((key, value) => value == null);
            final request = WebSocketRequest.generateRequest(messageMap);
            Globals.socket?.emitWithAck('msg/send', request, ack: (data) {
              final content = Content(
                  contentType: "SYS_TEXT",
                  textContent: TextContent(
                      text: AppLocalizations.of(context)!.withdrawShowStr));
              final Message showMessage = Message(
                  uuid: uuid.v4(),
                  seqId: seqId,
                  to: to!,
                  type: CreatorType.customer,
                  creatorType: CreatorType.staff,
                  content: content);
              ref
                  .read(chatStateProvider.notifier)
                  .deleteMessage(to!, uuid, showMessage);
            });
          }),
      // ItemModel(title: '多选', icon: Icons.playlist_add_check),
      // ItemModel(title: '引用', icon: Icons.format_quote),
      // ItemModel(title: '提醒', icon: Icons.add_alert),
      // ItemModel(title: '搜一搜',icon:  Icons.search),
    ];
    Widget buildLongPressMenu() {
      return ClipRRect(
        borderRadius: BorderRadius.circular(5),
        child: Container(
          width: 60, // width: 220, for 5
          color: const Color(0xFF4C4C4C),
          child: GridView.count(
            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 10),
            crossAxisCount: 1,
            // crossAxisCount: 5,
            crossAxisSpacing: 0,
            mainAxisSpacing: 10,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: menuItems
                .map(
                  (item) => GestureDetector(
                    behavior: HitTestBehavior.translucent,
                    onTap: () {
                      if (item.onTap != null) {
                        item.onTap!();
                      }
                      controller.hideMenu();
                    },
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: <Widget>[
                        Icon(
                          item.icon,
                          size: 20,
                          color: Colors.white,
                        ),
                        Container(
                          margin: const EdgeInsets.only(top: 2),
                          child: Text(
                            item.title,
                            style: const TextStyle(
                                color: Colors.white, fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                )
                .toList(),
          ),
        ),
      );
    }

    CustomPopupMenu customPopupMenu = CustomPopupMenu(
        context: context,
        menuBuilder: buildLongPressMenu,
        controller: controller);
    customPopupMenu.controller?.showMenu();
  }

  void _handleMessageTap(BuildContext context, types.Message message) async {
    if (message is types.FileMessage) {
      var localPath = message.uri;

      if (message.uri.startsWith('http')) {
        try {
          final index =
              _messages.indexWhere((element) => element.id == message.id);
          final updatedMessage =
              (_messages[index] as types.FileMessage).copyWith(
            isLoading: true,
          );

          setState(() {
            _messages[index] = updatedMessage;
          });

          final client = http.Client();
          final request = await client.get(Uri.parse(message.uri));
          final bytes = request.bodyBytes;
          final documentsDir = (await getApplicationDocumentsDirectory()).path;
          localPath = '$documentsDir/${message.name}';

          if (!File(localPath).existsSync()) {
            final file = File(localPath);
            await file.writeAsBytes(bytes);
          }
        } finally {
          final index =
              _messages.indexWhere((element) => element.id == message.id);
          final updatedMessage =
              (_messages[index] as types.FileMessage).copyWith(
            isLoading: null,
          );

          setState(() {
            _messages[index] = updatedMessage;
          });
        }
      }

      await OpenFilex.open(localPath);
    }
  }

  /// 先不获取网页的预览
  void _handlePreviewDataFetched(
    types.TextMessage message,
    types.PreviewData previewData,
  ) {
    final index = _messages.indexWhere((element) => element.id == message.id);
    final updatedMessage = (_messages[index] as types.TextMessage).copyWith(
      previewData: previewData,
    );

    setState(() {
      _messages[index] = updatedMessage;
    });
  }
}
