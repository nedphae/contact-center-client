import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import 'package:contact_mobile_client/states/state.dart';

class CustomerInfo extends StatefulHookConsumerWidget {
  final int selectUserId;
  const CustomerInfo(this.selectUserId, {super.key});

  @override
  CustomerInfoState createState() => CustomerInfoState();
}

/// 用户信息表单
/// 后期使用 Flutter Form Builder
class CustomerInfoState extends ConsumerState<CustomerInfo> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    const sizedBoxSpace = SizedBox(height: 24);
    // final args =
    // ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    // final selectUserId = args['selectUserId'] as int;
    final customer = ref.watch(chatStateProvider
        .select((value) => value.sessionMap[widget.selectUserId]?.customer));

    if (customer != null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text("客户信息"),
        ),
        body: Form(
          key: _formKey,
          child: Scrollbar(
            child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
              children: [
                sizedBoxSpace,
                TextFormField(
                  restorationId: 'uid_field',
                  textInputAction: TextInputAction.next,
                  textCapitalization: TextCapitalization.words,
                  readOnly: true,
                  decoration: const InputDecoration(
                    filled: true,
                    icon: Icon(Icons.person),
                    labelText: "客户UID",
                  ),
                  initialValue: customer.uid,
                ),
                sizedBoxSpace,
                TextFormField(
                  restorationId: 'name_field',
                  textInputAction: TextInputAction.next,
                  textCapitalization: TextCapitalization.words,
                  readOnly: true,
                  decoration: const InputDecoration(
                    filled: true,
                    icon: Icon(Icons.person),
                    hintText: "请输入姓名",
                    labelText: "姓名",
                  ),
                  initialValue: customer.name,
                ),
                sizedBoxSpace,
                TextFormField(
                  restorationId: 'name_field',
                  textInputAction: TextInputAction.next,
                  textCapitalization: TextCapitalization.words,
                  readOnly: true,
                  decoration: const InputDecoration(
                    filled: true,
                    icon: Icon(Icons.person),
                    hintText: "请输入Email",
                    labelText: "Email",
                  ),
                  initialValue: customer.email,
                ),
                sizedBoxSpace,
                TextFormField(
                  restorationId: 'name_field',
                  textInputAction: TextInputAction.next,
                  textCapitalization: TextCapitalization.words,
                  readOnly: true,
                  decoration: const InputDecoration(
                    filled: true,
                    icon: Icon(Icons.person),
                    hintText: "请输入手机号码",
                    labelText: "手机",
                  ),
                  initialValue: customer.mobile,
                ),
                sizedBoxSpace,
                TextFormField(
                  restorationId: 'name_field',
                  textInputAction: TextInputAction.next,
                  textCapitalization: TextCapitalization.words,
                  readOnly: true,
                  decoration: const InputDecoration(
                    filled: true,
                    icon: Icon(Icons.person),
                    hintText: "请输入客户地址",
                    labelText: "客户地址",
                  ),
                  initialValue: customer.address,
                ),
                sizedBoxSpace,
                TextFormField(
                  restorationId: 'name_field',
                  textInputAction: TextInputAction.next,
                  textCapitalization: TextCapitalization.words,
                  readOnly: true,
                  keyboardType: TextInputType.number,
                  maxLength: 2,
                  decoration: const InputDecoration(
                    filled: true,
                    icon: Icon(Icons.person),
                    hintText: "请输入Vip等级",
                    labelText: "Vip等级",
                  ),
                  initialValue: customer.vipLevel?.toString(),
                ),
                sizedBoxSpace,
                TextFormField(
                  restorationId: 'name_field',
                  textInputAction: TextInputAction.next,
                  textCapitalization: TextCapitalization.words,
                  readOnly: true,
                  decoration: const InputDecoration(
                    filled: true,
                    icon: Icon(Icons.person),
                    hintText: "请输入备注",
                    labelText: "备注",
                  ),
                  initialValue: customer.remarks,
                ),
              ],
            )),
          ),
        ),
      );
    } else {
      return const Text('没有获取到客户信息');
    }
  }
}
