import 'package:collection/collection.dart';
import 'package:contact_mobile_client/states/state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:badges/badges.dart';
import 'package:intl/intl.dart';

import '../model/message.dart';

class XBCSContacts extends StatefulHookConsumerWidget {
  final bool hide;

  const XBCSContacts({Key? key, this.hide = false}) : super(key: key);

  @override
  XBCSContactsState createState() => XBCSContactsState();
}

String getMessagePreview(BuildContext context, Message? message) {
  if (message == null) {
    return ' ';
  }
  String previewText = ' ';
  switch (message.content.contentType) {
    case 'SYS_TEXT':
    case 'TEXT':
      previewText = message.content.textContent?.text ?? '';
      break;
    case 'SYS':
      previewText = AppLocalizations.of(context)?.messageTypeSys ?? '';
      previewText = "[$previewText]";
      break;
    case 'IMAGE':
      previewText = AppLocalizations.of(context)?.messageTypeImage ?? '';
      previewText = "[$previewText]";
      break;
    case 'VOICE':
      previewText = AppLocalizations.of(context)?.messageTypeVoice ?? '';
      previewText = "[$previewText]";
      break;
    case 'FILE':
      previewText = AppLocalizations.of(context)?.messageTypeFile ?? '';
      previewText = "[$previewText]";
      break;
    case 'LINK':
      previewText = AppLocalizations.of(context)?.messageTypeLink ?? '';
      previewText = "[$previewText]";
      break;
    case 'RICH_TEXT':
      previewText = AppLocalizations.of(context)?.messageTypeRichText ?? '';
      previewText = "[$previewText]";
      break;
    case 'CUSTOMER':
      previewText = AppLocalizations.of(context)?.messageTypeCustomer ?? '';
      previewText = "[$previewText]";
      break;
    default:
      previewText = "[$previewText]";
      break;
  }
  return previewText;
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

    sessionList.sort((a, b) =>
            (b.lastMessage?.seqId ?? 0x7fffffffffffffff) -
            (a.lastMessage?.seqId ?? 0x7fffffffffffffff));

    if (sessionList.isEmpty) {
      return Text(AppLocalizations.of(context)!.thereIsNoSession);
    } else {
      return Scrollbar(
          child: ListView(
        restorationId: 'list_demo_list_view',
        padding: const EdgeInsets.symmetric(vertical: 8),
        children: List.generate(sessionList.length, (index) {
          final conv = sessionList[index].conversation;
          final customer = sessionList[index].customer;

          var staffDraft = sessionList[index].staffDraft;
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

          List<Widget> lastMsgWidgetList = [
            Flexible(
              child: Container(
                padding: const EdgeInsets.only(right: 13.0),
                child: Text(
                  staffDraft ?? getMessagePreview(context, lastMessage),
                  overflow: TextOverflow.fade,
                  maxLines: 1,
                  softWrap: false,
                  style: const TextStyle(
                    fontSize: 13.0,
                    color: Color(0xFF212121),
                  ),
                ),
              ),
            ),
          ];

          if (staffDraft != null && staffDraft.isNotEmpty) {
            lastMsgWidgetList.add(Text(
                '[${AppLocalizations.of(context)!.draft}]',
                style: const TextStyle(color: Colors.redAccent)));
            lastMsgWidgetList = lastMsgWidgetList.reversed.toList();
          }
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
              subtitle: Row(
                children: lastMsgWidgetList,
              ),
              trailing: Column(
                children: [
                  customer.status?.onlineStatus == 'ONLINE' &&
                          conv.endTime == null
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
