import 'dart:io';

import 'package:contact_mobile_client/common/config.dart';
import 'package:contact_mobile_client/common/token_utils.dart';
import 'package:contact_mobile_client/model/staff.dart';
import 'package:contact_mobile_client/states/state.dart';
import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:settings_ui/settings_ui.dart';

import 'package:hooks_riverpod/hooks_riverpod.dart';

class StaffInfoPage extends HookConsumerWidget {
  const StaffInfoPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final staff = ref.watch(staffProvider);

    if (staff != null) {
      return Column(
        children: <Widget>[
          const SizedBox(height: 24),
          ProfileWidget(
            imagePath: "$serverIp${staff.avatar}",
            // onClicked: () {
            //   Navigator.of(context).push(
            //     MaterialPageRoute(builder: (context) => EditProfilePage()),
            //   );
            // },
          ),
          const SizedBox(height: 24),
          buildName(staff),
          const SizedBox(height: 48),
          Expanded(
            child: SettingsList(
              platform: DevicePlatform.iOS,
              sections: [
                SettingsSection(
                  tiles: <SettingsTile>[
                    SettingsTile.navigation(
                      title: const Text('在线状态'),
                      trailing:
                          buildOnlineStatus(staff.staffStatus?.onlineStatus),
                      onPressed: (context) async {
                        showModalBottomSheet<void>(
                          context: context,
                          builder: (context) {
                            return const OnlineStatusBottomSheet();
                          },
                        );
                      },
                    ),
                    SettingsTile.navigation(
                      title: const Text('不再接受离线通知'),
                      onPressed: (context) async {
                        await graphQLClient.mutate(MutationOptions(
                            document: gql(Staff.offlineClientMutation),
                            variables: const {
                              'staffChangeStatus': {'clientId': 'ANDROID'}
                            }));
                        showDialog<String>(
                          context: context,
                          builder: (BuildContext context) => AlertDialog(
                            content: const Text('关闭离线通知成功，是否退出应用'),
                            actions: <Widget>[
                              TextButton(
                                onPressed: () =>
                                    Navigator.pop(context, 'Cancel'),
                                child: const Text('取消'),
                              ),
                              TextButton(
                                onPressed: () {
                                  Navigator.pop(context, 'OK');
                                  exit(0);
                                },
                                child: const Text('退出'),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                    SettingsTile.navigation(
                      leading: const Icon(Icons.logout),
                      title: const Text('退出登录'),
                      onPressed: (context) async {
                        clearToken();
                        Navigator.of(context).pushNamedAndRemoveUntil(
                            '/login', ModalRoute.withName('/'));
                        await graphQLClient.mutate(MutationOptions(
                            document: gql(Staff.offlineClientMutation),
                            variables: const {
                              'staffChangeStatus': {'clientId': 'ANDROID'}
                            }));
                      },
                    ),
                    SettingsTile.navigation(
                      leading: const Icon(Icons.exit_to_app),
                      title: const Text('退出应用'),
                      onPressed: (context) => exit(0),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      );
    } else {
      return Column(
        children: const [
          SizedBox(height: 32),
          CircularProgressIndicator(),
          SizedBox(height: 32),
          Text('正在读取个人信息...')
        ],
      );
    }
  }

  Widget buildName(Staff staff) => Column(
        children: [
          Text(
            staff.realName,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 24),
          ),
          const SizedBox(height: 4),
          Text(
            staff.nickName,
            style: const TextStyle(color: Colors.grey),
          )
        ],
      );

  Widget buildOnlineStatus(OnlineStatus? onlineStatus) {
    var onlineStatusStr = '在线';
    switch (onlineStatus) {
      case OnlineStatus.offline:
        onlineStatusStr = "离线";
        break;
      case OnlineStatus.busy:
        onlineStatusStr = "忙碌";
        break;
      case OnlineStatus.away:
        onlineStatusStr = "离开";
        break;
      default:
        break;
    }
    return Text(onlineStatusStr);
  }
}

class ProfileWidget extends StatelessWidget {
  final String? imagePath;
  final bool isEdit;
  final VoidCallback? onClicked;

  const ProfileWidget({
    Key? key,
    this.imagePath,
    this.isEdit = false,
    this.onClicked,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme.primary;

    return Center(
      child: Stack(
        children: [
          buildImage(),
          // Positioned(
          //   bottom: 0,
          //   right: 4,
          //   child: buildEditIcon(color),
          // ),
        ],
      ),
    );
  }

  Widget buildImage() {
    final image =
        imagePath != null ? NetworkImage(imagePath!) : const AssetImage('');

    return ClipOval(
      child: Material(
        color: Colors.transparent,
        child: Ink.image(
          image: image as ImageProvider<Object>,
          fit: BoxFit.cover,
          width: 128,
          height: 128,
          // child: InkWell(onTap: onClicked),
        ),
      ),
    );
  }

  Widget buildEditIcon(Color color) => buildCircle(
        color: Colors.white,
        all: 3,
        child: buildCircle(
          color: color,
          all: 8,
          child: Icon(
            isEdit ? Icons.add_a_photo : Icons.edit,
            color: Colors.white,
            size: 20,
          ),
        ),
      );

  Widget buildCircle({
    required Widget child,
    required double all,
    required Color color,
  }) =>
      ClipOval(
        child: Container(
          padding: EdgeInsets.all(all),
          color: color,
          child: child,
        ),
      );
}

class OnlineStatusBottomSheet extends HookConsumerWidget {
  const OnlineStatusBottomSheet({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    updateOnlineStatus(String onlineStatus) async {
      final result = await graphQLClient.mutate(MutationOptions(
          document: gql(StaffStatus.mutationOnlineStatus),
          variables: {
            "updateStaffStatus": {"onlineStatus": onlineStatus}
          }));

      final staffStatusReslut =
          StaffStatus.fromJson(result.data?["updateStaffStatus"]);
      ref
          .read(staffProvider.notifier)
          .addStaffStatus(staffStatus: staffStatusReslut);
    }

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text("在线状态"),
        toolbarHeight: 40,
      ),
      body: SettingsList(
        platform: DevicePlatform.iOS,
        sections: [
          SettingsSection(
            tiles: <SettingsTile>[
              SettingsTile.navigation(
                title: const Text('在线'),
                onPressed: (context) async {
                  final navigator = Navigator.of(context);
                  await updateOnlineStatus("ONLINE");
                  navigator.pop();
                },
              ),
              SettingsTile.navigation(
                title: const Text('离线'),
                onPressed: (context) async {
                  final navigator = Navigator.of(context);
                  await updateOnlineStatus("OFFLINE");
                  navigator.pop();
                },
              ),
              SettingsTile.navigation(
                title: const Text('忙碌'),
                onPressed: (context) async {
                  final navigator = Navigator.of(context);
                  await updateOnlineStatus("BUSY");
                  navigator.pop();
                },
              ),
              SettingsTile.navigation(
                title: const Text('离开'),
                onPressed: (context) async {
                  final navigator = Navigator.of(context);
                  await updateOnlineStatus("AWAY");
                  navigator.pop();
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}
