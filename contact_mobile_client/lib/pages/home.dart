import 'dart:async';
import 'dart:convert';

import 'package:contact_mobile_client/common/config.dart';
import 'package:contact_mobile_client/common/globals.dart';
import 'package:contact_mobile_client/common/token_utils.dart';
import 'package:contact_mobile_client/model/conversation.dart';
import 'package:contact_mobile_client/model/customer.dart';
import 'package:contact_mobile_client/model/message.dart';
import 'package:contact_mobile_client/model/staff.dart';
import 'package:contact_mobile_client/model/web_socket_request.dart';
import 'package:contact_mobile_client/hook/graphql_client.dart';
import 'package:contact_mobile_client/pages/contacts.dart';
import 'package:contact_mobile_client/pages/staff_info.dart';
import 'package:contact_mobile_client/states/state.dart';
import 'package:flutter/material.dart';
import 'package:animations/animations.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:socket_io_client/socket_io_client.dart';
import 'package:jpush_flutter/jpush_flutter.dart';

_initCustomerInfo(
    WidgetRef ref, GraphQLClient client, List<Conversation> convList) async {
  for (var element in convList) {
    final userId = element.userId;
    // 读取 客户信息
    final result = await client.query(QueryOptions(
      document: gql(Customer.queryCustomer),
      variables: {'userId': userId},
      fetchPolicy: FetchPolicy.noCache,
    ));
    final customerMap = result.data?['getCustomer'];
    if (customerMap != null) {
      final customer = Customer.fromJson(customerMap);
      final session = Session(
          conversation: element, customer: customer, messageList: List.empty());
      ref.read(chatStateProvider.notifier).addConv(session: session);
    }
  }
}

class XBCSHomeContainer extends HookConsumerWidget {
  const XBCSHomeContainer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final client = useGraphQLClient();
    final convListResult = useQuery(
      QueryOptions(
        document: gql(Conversation
            .queryConv), // this is the query string you just created
        // pollInterval: const Duration(seconds: 10),,
        fetchPolicy: FetchPolicy.noCache,
      ),
    );

    final isLoading = convListResult.result.isLoading;
    final List<Conversation>? convList =
        (convListResult.result.data?['onlineConversationByStaffId'] as List?)
            ?.map((e) => Conversation.fromJson(e))
            .toList();

    if (convList != null && convList.isNotEmpty) {
      _initCustomerInfo(ref, client, convList);
    }
    return XBCSHome(isLoading: isLoading);
  }
}

class XBCSHome extends StatefulHookConsumerWidget {
  final bool isLoading;

  // const ChatterLogin({super.key});
  const XBCSHome({this.isLoading = false, Key? key}) : super(key: key);

  @override
  XBCSHomeState createState() => XBCSHomeState();
}

class XBCSHomeState extends ConsumerState<XBCSHome>
    with RestorationMixin, WidgetsBindingObserver {
  Staff? _staffInfo;
  Timer? _timer;
  bool connected = false;
  bool paused = false;
  final JPush jPush = JPush();
  final RestorableInt _currentIndex = RestorableInt(0);

  @override
  void initState() {
    super.initState();
    () async {
      final staffInfo = await _getRemoteData();
      _staffInfo = staffInfo;
      if (staffInfo != null) {
        _initWS(staffInfo);
      }
    }();

    jPush.setup(
      appKey: '5c1dbc4aae1e51031ba51d91',
      channel: "developer-default",
      production: false,
      debug: true, // 设置是否打印 debug 日志
    );

    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    switch (state) {
      case AppLifecycleState.resumed:
        // 返回前台
        paused = false;
        break;
      case AppLifecycleState.inactive:
        // TODO: Handle this case.
        break;
      case AppLifecycleState.paused:
        // 进入后台
        paused = true;
        break;
      case AppLifecycleState.detached:
        // TODO: Handle this case.
        break;
    }
  }

  @override
  void dispose() {
    _currentIndex.dispose();
    // TODO 移动到注销按钮
    Globals.socket?.dispose();
    Globals.socket = null;
    if (_timer != null) {
      _timer?.cancel();
    }
    super.dispose();
  }

  Future<String?> sendNotification(String title, String content) async {
    if (paused) {
      var localNotification = LocalNotification(
        id: 2,
        title: title,
        buildId: 1,
        content: content,
        fireTime: DateTime.now(),
      );
      return await jPush.sendLocalNotification(localNotification);
    } else {
      return null;
    }
  }

  _initWS(Staff staff) async {
    final token = Globals.prefs.getString(Globals.prefsAccessToken);
    if (Globals.socket == null) {
      final registrationId = await jPush.getRegistrationID();

      final socket = IO.io(
          "$serverIp/im/staff",
          OptionBuilder()
              .setQuery({'token': token}).setTransports(['websocket']).build());
      socket.onConnect((_) {
        // 注册客服信息
        final staffInfo = _staffInfo;
        if (staffInfo != null) {
          intervalConfigStaff(Timer? timer) {
            socket.emitWithAck(
                'register',
                WebSocketRequest.generateRequest({
                  'onlineStatus': 1,
                  'groupId': staffInfo.groupId,
                  'deviceType': 'ANDROID',
                  // 手机客户端注册id，用于推送
                  'registrationId': registrationId,
                }), ack: (data) {
              if (data != null) {
                final response = WebSocketResponse.fromJson(data);
                final staffStatus = StaffStatus.fromJson(response.body);
                ref
                    .read(staffProvider.notifier)
                    .addStaffStatus(staffStatus: staffStatus);
              }
            });
          }

          _timer =
              Timer.periodic(const Duration(minutes: 5), intervalConfigStaff);
          intervalConfigStaff(_timer);
          setState(() {
            connected = true;
          });
        }
      });
      socket.on('msg/sync', (data) {
        // 新消息
        final dataList = data as List;
        final ack = dataList.last as Function;

        final request = WebSocketRequest.fromJson(data.first);
        if (request.body != null) {
          final updateMessage = UpdateMessage.fromJson(request.body);
          final message = updateMessage.message;
          final userId = message.creatorType == CreatorType.customer
              ? message.from
              : message.to;
          if (!message.isSys && userId != null) {
            ref.read(chatStateProvider.notifier).newMessage({userId: message});

            final session = ref.read(chatStateProvider).sessionMap[userId];
            // 推送通知
            var messageNotificationStr = "";
            switch (message.content.contentType) {
              case "IMAGE":
                messageNotificationStr = "[图片]";
                break;
              case "TEXT":
                messageNotificationStr =
                    message.content.textContent?.text ?? "";
                break;
              default:
                break;
            }

            sendNotification(
                session?.customer.name ?? session?.conversation.uid ?? '',
                messageNotificationStr);
          } else {
            final content = message.content;
            final serviceMessage = content.serviceContent;
            switch (content.sysCode) {
              case 'CONV_END':
                if (serviceMessage != null) {
                  final endedConv = Conversation.fromJson(
                      jsonDecode(serviceMessage) as Map<String, dynamic>);
                  _initCustomerInfo(ref, graphQLClient, [endedConv]);
                }
                break;
              default:
                break;
            }
          }
          ack(WebSocketResponse(header: request.header, code: 200, body: 'OK'));
        } else {
          ack(WebSocketResponse(
              header: request.header, code: 400, body: 'request empty'));
        }
      });
      socket.on('assign', (data) {
        // 分配客服
        final dataList = data as List;
        final ack = dataList.last as Function;

        final request = WebSocketRequest.fromJson(data.first);
        if (request.body != null) {
          final conv = Conversation.fromJson(request.body);
          _initCustomerInfo(ref, graphQLClient, [conv]);
          ack(WebSocketResponse(header: request.header, code: 200, body: 'OK'));

          sendNotification(conv.uid, '您有新的会话');
        } else {
          ack(WebSocketResponse(
              header: request.header, code: 400, body: 'request empty'));
        }
      });
      socket.onDisconnect((data) async {
        // 需要重新连接，更新 token
        final token = await getAccessToken();
        Globals.socket?.query = 'token=$token';
        setState(() {
          connected = false;
        });
      });

      Globals.socket = socket;
    }
  }

  Future<Staff?> _getRemoteData() async {
    final token = Globals.prefs.getString(Globals.prefsAccessToken);
    if (token != null) {
      // 获取用户信息 并添加到 状态容器
      final staffInfo = await getStaffInfo();
      if (staffInfo != null) {
        ref.read(staffProvider.notifier).setLoginStaff(staff: staffInfo);
        return staffInfo;
      }
    }
    return Future.delayed(const Duration(seconds: 1), () {
      if (!mounted) return;
      Navigator.of(context).pushNamed('/login');
      return null;
    });
  }

  static const List<Widget> _widgetOptions = <Widget>[
    XBCSContacts(),
    XBCSContacts(hide: true),
    StaffInfoPage(),
  ];

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    var bottomNavigationBarItems = <BottomNavigationBarItem>[
      const BottomNavigationBarItem(
        icon: Icon(Icons.chat),
        label: '聊天',
      ),
      const BottomNavigationBarItem(
        icon: Icon(Icons.history),
        label: '历史',
      ),
      const BottomNavigationBarItem(
        icon: Icon(Icons.account_circle),
        label: '我',
      ),
    ];
    var title =
        bottomNavigationBarItems.elementAt(_currentIndex.value).label ?? '';
    title = connected ? title : " 正在连接...";

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Text(title),
      ),
      body: Center(
        child: PageTransitionSwitcher(
          transitionBuilder: (child, animation, secondaryAnimation) {
            return FadeThroughTransition(
              animation: animation,
              secondaryAnimation: secondaryAnimation,
              child: child,
            );
          },
          child: widget.isLoading && _currentIndex.value < 2
              ? Column(
                  children: const [
                    SizedBox(height: 32),
                    CircularProgressIndicator(),
                    SizedBox(height: 32),
                    Text('正在加载会话...')
                  ],
                )
              : _widgetOptions.elementAt(_currentIndex.value),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        showUnselectedLabels: true,
        items: bottomNavigationBarItems,
        currentIndex: _currentIndex.value,
        type: BottomNavigationBarType.fixed,
        selectedFontSize: textTheme.caption!.fontSize!,
        unselectedFontSize: textTheme.caption!.fontSize!,
        onTap: (index) {
          setState(() {
            _currentIndex.value = index;
          });
        },
        selectedItemColor: colorScheme.onPrimary,
        unselectedItemColor: colorScheme.onPrimary.withOpacity(0.38),
        backgroundColor: colorScheme.primary,
      ),
    );
  }

  @override
  String? get restorationId => 'home_bottom_navigation';

  @override
  void restoreState(RestorationBucket? oldBucket, bool initialRestore) {
    registerForRestoration(_currentIndex, 'home_bottom_navigation_tab_index');
  }
}
