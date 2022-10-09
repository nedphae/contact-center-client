import 'dart:io';

import 'package:contact_moblie_client/common/config.dart';
import 'package:contact_moblie_client/common/token_utils.dart';
import 'package:contact_moblie_client/model/staff.dart';
import 'package:contact_moblie_client/states/staff_state.dart';
import 'package:flutter/material.dart';

import 'package:hooks_riverpod/hooks_riverpod.dart';

class StaffInfoPage extends StatefulHookConsumerWidget {
  const StaffInfoPage({Key? key}) : super(key: key);

  @override
  StaffInfoPageState createState() => StaffInfoPageState();
}

class StaffInfoPageState extends ConsumerState<StaffInfoPage> {
  @override
  Widget build(BuildContext context) {
    final staff = ref.watch(staffProvider)!;
    return ListView(
      physics: const BouncingScrollPhysics(),
      children: [
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
        Divider(
          color: Colors.grey.shade300,
          height: 20,
          thickness: 1,
          indent: 0,
          endIndent: 0,
        ),
        ListTile(
          title: const Text(
            '退出登录',
          ),
          leading: const Icon(Icons.logout),
          onTap: () {
            clearToken();
            Navigator.of(context)
                .pushNamedAndRemoveUntil('/login', ModalRoute.withName('/'));
          },
        ),
        Divider(
          color: Colors.grey.shade300,
          height: 20,
          thickness: 1,
          indent: 30,
          endIndent: 30,
        ),
        ListTile(
          title: const Text(
            '退出应用',
          ),
          leading: const Icon(Icons.exit_to_app),
          onTap: () => exit(0),
        ),
      ],
    );
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
