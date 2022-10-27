import 'package:contact_mobile_client/states/state.dart';
import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:badges/badges.dart';
import 'package:intl/intl.dart';

class XBCSContacts extends StatefulHookConsumerWidget {
  final bool hide;
  const XBCSContacts({Key? key, this.hide = false}) : super(key: key);

  @override
  XBCSContactsState createState() => XBCSContactsState();
}

class XBCSContactsState extends ConsumerState<XBCSContacts> {
  final dateFormat = DateFormat('HH:mm');

  @override
  Widget build(BuildContext context) {
    final sessionList = ref
        .watch(chatStateProvider.select((value) => value.sessionMap))
        .values
        .where((element) => widget.hide == element.hide)
        .toList();

    if (sessionList.isEmpty) {
      return const Text('没有会话');
    } else {
      return Scrollbar(
          child: ListView(
        restorationId: 'list_demo_list_view',
        padding: const EdgeInsets.symmetric(vertical: 8),
        children: List.generate(sessionList.length, (index) {
          final customer = sessionList[index].customer;
          final lastMessage = sessionList[index].lastMessage;
          final lastMsgTime =
              lastMessage != null && lastMessage.createdAt != null
                  ? DateTime.fromMillisecondsSinceEpoch(
                      lastMessage.createdAt!.toInt() * 1000,
                      isUtc: true)
                  : null;
          final lastMsgTimeStr = lastMsgTime != null
              ? dateFormat.format(lastMsgTime.toLocal())
              : '';

          return ListTile(
              onTap: () {
                ref
                    .read(chatStateProvider.notifier)
                    .setChattingUser(sessionList[index].conversation.userId);
                // 选择会话，跳转到聊天页面，并通过 ModalRoute 获取传递的参数
                // final args = ModalRoute.of(context)!.settings.arguments
                Navigator.pushNamed(context, '/chat', arguments: {
                  'selectUserId': sessionList[index].conversation.userId
                });
              },
              leading: ExcludeSemantics(
                child: Badge(
                  showBadge: sessionList[index].unread > 0,
                  badgeContent: Text(sessionList[index].unread.toString()),
                  child: const CircleAvatar(child: Icon(Icons.account_circle)),
                ),
              ),
              title: Text(
                customer.name,
              ),
              subtitle: Text(lastMessage?.content.textContent?.text ?? '',
                  overflow: TextOverflow.ellipsis),
              trailing: Column(
                children: [
                  customer.status.onlineStatus == 'ONLINE'
                      ? const Icon(Icons.sync_alt)
                      : const Icon(Icons.signal_wifi_off),
                  Text(lastMsgTimeStr),
                ],
              ));
        }),
      ));
    }
  }
}
