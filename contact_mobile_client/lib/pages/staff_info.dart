import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:contact_mobile_client/common/config.dart';
import 'package:contact_mobile_client/common/token_utils.dart';
import 'package:contact_mobile_client/model/staff.dart';
import 'package:contact_mobile_client/states/state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:settings_ui/settings_ui.dart';

import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../common/globals.dart';
import '../main.dart';

class StaffInfoPage extends HookConsumerWidget {
  const StaffInfoPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final staff = ref.watch(staffProvider);
    final languageCode = MyApp.of(context)?.getLocal().languageCode;
    final language =
        Globals.languageMap[languageCode] ?? Globals.languageMap['zh']!;

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
                      title: Text(AppLocalizations.of(context)!.onlineStatus),
                      value: buildOnlineStatus(
                          context, staff.staffStatus?.onlineStatus),
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
                      leading: const Icon(Icons.language),
                      title: Text(AppLocalizations.of(context)!.language),
                      value: Text(language.displayName),
                      onPressed: (context) async {
                        showModalBottomSheet<void>(
                          context: context,
                          builder: (context) {
                            return const LanguageChangeBottomSheet();
                          },
                        );
                      },
                    ),
                    SettingsTile.navigation(
                      title: Text(AppLocalizations.of(context)!
                          .noMoreOfflineNotifications),
                      onPressed: (context) async {
                        await graphQLClient.mutate(MutationOptions(
                            document: gql(Staff.offlineClientMutation),
                            variables: const {
                              'staffChangeStatus': {'clientId': 'ANDROID'}
                            }));
                        showDialog<String>(
                          context: context,
                          builder: (BuildContext context) => AlertDialog(
                            content: Text(AppLocalizations.of(context)!
                                .theOfflineNotificationIsSuccessfulExitTheApp),
                            actions: <Widget>[
                              TextButton(
                                onPressed: () =>
                                    Navigator.pop(context, 'Cancel'),
                                child:
                                    Text(AppLocalizations.of(context)!.cancel),
                              ),
                              TextButton(
                                onPressed: () {
                                  Navigator.pop(context, 'OK');
                                  exit(0);
                                },
                                child: Text(AppLocalizations.of(context)!.exit),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                    SettingsTile.navigation(
                      leading: const Icon(Icons.logout),
                      title: Text(AppLocalizations.of(context)!.signOut),
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
                      title: Text(AppLocalizations.of(context)!.exitTheApp),
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
        children: [
          const SizedBox(height: 32),
          const CircularProgressIndicator(),
          const SizedBox(height: 32),
          Text(AppLocalizations.of(context)!.readingPersonalInformation)
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

  Widget buildOnlineStatus(BuildContext context, OnlineStatus? onlineStatus) {
    var onlineStatusStr = AppLocalizations.of(context)!.online;
    switch (onlineStatus) {
      case OnlineStatus.offline:
        onlineStatusStr = AppLocalizations.of(context)!.offline;
        break;
      case OnlineStatus.busy:
        onlineStatusStr = AppLocalizations.of(context)!.busy;
        break;
      case OnlineStatus.away:
        onlineStatusStr = AppLocalizations.of(context)!.away;
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
    final image = imagePath != null
        ? CachedNetworkImageProvider(imagePath!)
        : const AssetImage('');

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

class LanguageChangeBottomSheet extends HookConsumerWidget {
  const LanguageChangeBottomSheet({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settingsTileList = Globals.languageMap.entries.map((e) {
      return SettingsTile.navigation(
        title: Text(e.value.displayName),
        onPressed: (context) async {
          final navigator = Navigator.of(context);
          MyApp.of(context)?.setLocale(Locale.fromSubtags(languageCode: e.key));
          navigator.pop();
        },
      );
    }).toList();

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Text(AppLocalizations.of(context)!.language),
        toolbarHeight: 40,
      ),
      body: SettingsList(
        platform: DevicePlatform.iOS,
        sections: [
          SettingsSection(
            tiles: settingsTileList,
          ),
        ],
      ),
    );
  }
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
        title: Text(AppLocalizations.of(context)!.onlineStatus),
        toolbarHeight: 40,
      ),
      body: SettingsList(
        platform: DevicePlatform.iOS,
        sections: [
          SettingsSection(
            tiles: <SettingsTile>[
              SettingsTile.navigation(
                title: Text(AppLocalizations.of(context)!.online),
                onPressed: (context) async {
                  final navigator = Navigator.of(context);
                  await updateOnlineStatus("ONLINE");
                  navigator.pop();
                },
              ),
              SettingsTile.navigation(
                title: Text(AppLocalizations.of(context)!.offline),
                onPressed: (context) async {
                  final navigator = Navigator.of(context);
                  await updateOnlineStatus("OFFLINE");
                  navigator.pop();
                },
              ),
              SettingsTile.navigation(
                title: Text(AppLocalizations.of(context)!.busy),
                onPressed: (context) async {
                  final navigator = Navigator.of(context);
                  await updateOnlineStatus("BUSY");
                  navigator.pop();
                },
              ),
              SettingsTile.navigation(
                title: Text(AppLocalizations.of(context)!.away),
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
