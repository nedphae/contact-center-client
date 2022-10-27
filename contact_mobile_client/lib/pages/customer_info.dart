import 'package:contact_mobile_client/common/color_utils.dart';
import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:chips_input/chips_input.dart';

import 'package:contact_mobile_client/states/state.dart';

import '../model/customer.dart';

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
    final tags = customer?.tags;

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
                    tags != null && tags.isNotEmpty
                        ? Column(
                            children: [
                              sizedBoxSpace,
                              ChipsInput<CustomerTag>(
                                decoration: const InputDecoration(
                                  filled: true,
                                  icon: Icon(Icons.label),
                                  labelText: "客户标签",
                                ),
                                initialValue: tags,
                                readOnly: true,
                                findSuggestions: (query) {
                                  return List.empty();
                                },
                                chipBuilder: (BuildContext context,
                                    ChipsInputState<dynamic> state, tag) {
                                  return InputChip(
                                    key: ObjectKey(tag),
                                    label: Text(tag.name),
                                    backgroundColor:
                                        ColorUtil.fromHex(tag.color),
                                    onSelected: (value) {},
                                    materialTapTargetSize:
                                        MaterialTapTargetSize.shrinkWrap,
                                  );
                                },
                                suggestionBuilder:
                                    (context, CustomerTag profile) {
                                  return ListTile(
                                    key: ObjectKey(profile),
                                    title: Text(profile.name),
                                  );
                                },
                              )
                            ],
                          )
                        : const SizedBox.shrink(),
                    sizedBoxSpace,
                    TextFormField(
                      restorationId: 'email_field',
                      textInputAction: TextInputAction.next,
                      textCapitalization: TextCapitalization.words,
                      readOnly: true,
                      decoration: const InputDecoration(
                        filled: true,
                        icon: Icon(Icons.email),
                        hintText: "请输入Email",
                        labelText: "Email",
                      ),
                      initialValue: customer.email,
                    ),
                    sizedBoxSpace,
                    TextFormField(
                      restorationId: 'mobile_field',
                      textInputAction: TextInputAction.next,
                      textCapitalization: TextCapitalization.words,
                      readOnly: true,
                      decoration: const InputDecoration(
                        filled: true,
                        icon: Icon(Icons.phone_android),
                        hintText: "请输入手机号码",
                        labelText: "手机",
                      ),
                      initialValue: customer.mobile,
                    ),
                    sizedBoxSpace,
                    TextFormField(
                      restorationId: 'address_field',
                      textInputAction: TextInputAction.next,
                      textCapitalization: TextCapitalization.words,
                      readOnly: true,
                      decoration: const InputDecoration(
                        filled: true,
                        icon: Icon(Icons.home),
                        hintText: "请输入客户地址",
                        labelText: "客户地址",
                      ),
                      initialValue: customer.address,
                    ),
                    sizedBoxSpace,
                    TextFormField(
                      restorationId: 'vip_field',
                      textInputAction: TextInputAction.next,
                      textCapitalization: TextCapitalization.words,
                      readOnly: true,
                      keyboardType: TextInputType.number,
                      maxLength: 2,
                      decoration: const InputDecoration(
                        filled: true,
                        icon: Icon(Icons.star),
                        hintText: "请输入Vip等级",
                        labelText: "Vip等级",
                      ),
                      initialValue: customer.vipLevel?.toString(),
                    ),
                    sizedBoxSpace,
                    TextFormField(
                      restorationId: 'remarks_field',
                      textInputAction: TextInputAction.next,
                      textCapitalization: TextCapitalization.words,
                      readOnly: true,
                      decoration: const InputDecoration(
                        filled: true,
                        icon: Icon(Icons.note),
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
