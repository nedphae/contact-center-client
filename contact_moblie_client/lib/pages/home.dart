import 'package:contact_moblie_client/common/config.dart';
import 'package:contact_moblie_client/common/globals.dart';
import 'package:contact_moblie_client/model/conversation.dart';
import 'package:contact_moblie_client/model/customer.dart';
import 'package:contact_moblie_client/model/staff.dart';
import 'package:contact_moblie_client/model/web_socket_request.dart';
import 'package:contact_moblie_client/hook/graphql_client.dart';
import 'package:contact_moblie_client/states/staff_state.dart';
import 'package:flutter/material.dart';
import 'package:animations/animations.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:socket_io_client/socket_io_client.dart';

class XBCSHome extends StatefulHookConsumerWidget {
  // const ChatterLogin({super.key});
  const XBCSHome({Key? key}) : super(key: key);

  @override
  XBCSHomeState createState() => XBCSHomeState();
}

class XBCSHomeState extends ConsumerState<XBCSHome> {
  Staff? _staffInfo;
  final RestorableInt _currentIndex = RestorableInt(0);

  @override
  void initState() {
    super.initState();
    final staffInfo = _getRemoteData();
    _staffInfo = staffInfo;
    if (staffInfo != null) {
      _initWS(staffInfo);
    }
  }

  @override
  void dispose() {
    _currentIndex.dispose();
    super.dispose();
  }

  _initWS(Staff staff) {
    final token = ref.watch(jwtProvider)?.accessToken;

    final socket = IO.io(
        "$serverIp/im/staff",
        OptionBuilder()
            .setQuery({'token': token}).setTransports(['websocket']).build());
    socket.onConnect((data) {
      // 注册客服信息
      final staffInfo = _staffInfo;
      if (staffInfo != null) {
        socket.emit(
            'register',
            WebSocketRequest.generateRequest({
              'onlineStatus': 1,
              'groupId': staffInfo.groupId,
            }));
      }
    });
    socket.on('msg/sync', (data) {
      // 新消息
    });
    socket.on('assign', (data) {
      // 分配客服
    });
    socket.onDisconnect((data) => null);

    Globals.socket = socket;
  }

  Future<Staff?> _getStaffInfo(String accessToken) async {
    String url = "$serverIp/staff/info";
    var res = await http.post(Uri.parse(url), headers: <String, String>{
      'Authorization': "Bearer $accessToken",
    });
    if (res.statusCode == 200) {
      final parsed = jsonDecode(res.body) as Map<String, dynamic>;
      return Staff.fromJson(parsed);
    }
    return null;
  }

  _getRemoteData() async {
    final jwt = ref.watch(jwtProvider);
    if (jwt != null) {
      // 获取用户信息 并添加到 状态容器
      final staffInfo = await _getStaffInfo(jwt.accessToken);
      if (staffInfo != null) {
        ref.read(staffProvider.notifier).setLoginStaff(staff: staffInfo);
        return staffInfo;
      }
    }
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) return;
      Navigator.of(context).pushNamed('/login');
    });
  }

  _initCustomerInfo(GraphQLClient client, List<Conversation> convList) async {
    for (var element in convList) {
      final userId = element.userId;
      // 读取 客户信息
      final result = await client.query(QueryOptions(
          document: gql(Customer.queryCustomer),
          variables: {'userId': userId}));
      final customerMap = result.data?['getCustomer'];
      if (customerMap != null) {
        final customer = Customer.fromJson(customerMap);
        final session = Session(
            conversation: element,
            customer: customer,
            messageaList: List.empty());
        ref.read(sessionProvider.notifier).addConv(session: session);
      }
    }
  }

  static const List<Widget> _widgetOptions = <Widget>[
    Text(
      'Index 0: Home',
      style: optionStyle,
    ),
    Text(
      'Index 1: Business',
      style: optionStyle,
    ),
    Text(
      'Index 2: School',
      style: optionStyle,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    final client = useGraphQLClient();
    final convListResult = useQuery(
      QueryOptions(
        document: gql(Conversation
            .queryConv), // this is the query string you just created
        // pollInterval: const Duration(seconds: 10),
      ),
    );

    final isLoading = convListResult.result.isLoading;
    final List<Conversation>? convList =
        (convListResult.result.data?['onlineConversationByStaffId'] as List?)
            ?.map((e) => Conversation.fromJson(e))
            .toList();

    if (isLoading) {
      return const Text('正在加载会话');
    } else {
      if (convList != null && convList.isNotEmpty) {
        _initCustomerInfo(client, convList);
      }

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
      final title = bottomNavigationBarItems.elementAt(_currentIndex.value).label ?? '';

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
            child: _widgetOptions.elementAt(_currentIndex.value),
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
  }
}
