import 'package:contact_moblie_client/common/config.dart';
import 'package:contact_moblie_client/model/staff.dart';
import 'package:contact_moblie_client/states/staff_state.dart';
import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

class XBCSContacts extends StatefulHookConsumerWidget {
  const XBCSContacts({Key? key}) : super(key: key);

  @override
  XBCSContactsState createState() => XBCSContactsState();
}

class XBCSContactsState extends ConsumerState<XBCSContacts> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final sessionList = ref.watch(sessionProvider)?.values.toList() ?? [];

    return Scrollbar(
      child: ListView(
        restorationId: 'list_demo_list_view',
        padding: const EdgeInsets.symmetric(vertical: 8),
        children: [
          for (int index = 0; index < sessionList.length; index++)
            ListTile(
              onTap: () {
                // 选择会话，跳转到聊天页面，并通过 ModalRoute 获取传递的参数
                // final args = ModalRoute.of(context)!.settings.arguments
                Navigator.pushNamed(context, '/chat', arguments: {
                  'selectUserId': sessionList[index].conversation.userId
                });
              },
              leading: const ExcludeSemantics(
                child: CircleAvatar(child: Icon(Icons.account_circle)),
              ),
              title: Text(
                sessionList[index].customer.name,
              ),
              subtitle: Text(
                  sessionList[index].lastMessage?.content.textContent?.text ??
                      ''),
            ),
        ],
      ),
    );
  }
}
