import 'package:contact_mobile_client/common/color_utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
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

    final tagListResult = useQuery(
      QueryOptions(
        document: gql(CustomerTag
            .queryCustomerTag), // this is the query string you just created
        // pollInterval: const Duration(seconds: 10),,
        // fetchPolicy: FetchPolicy.noCache,
      ),
    );
    final tagList = (tagListResult.result.data?['getAllCustomerTag'] as List?)
        ?.map((e) => CustomerTag.fromJson(e))
        .toList();
    final updateCustomer = useMutation(MutationOptions(
      document: gql(Customer.updateCustomer),
      onError: (error) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text(
                  '${AppLocalizations.of(context)!.saveFailed}：${error.toString()}'),
              backgroundColor: Colors.redAccent),
        );
      },
      update: (GraphQLDataProxy cache, QueryResult? result) {
        if (result?.data != null) {
          // If the form is valid, display a snackbar. In the real world,
          // you'd often call a server or save the information in a database.
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
                content: Text(AppLocalizations.of(context)!.saveSuccessful)),
          );
          final customerJson = result?.data?['updateCustomer'];
          if (customerJson != null) {
            final customer = Customer.fromJson(customerJson);
            ref.read(chatStateProvider.notifier).updateCustomer(customer);
          }
        }
      },
    ));

    // final args =
    // ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    // final selectUserId = args['selectUserId'] as int;
    final customer = ref
        .watch(chatStateProvider
            .select((value) => value.sessionMap[widget.selectUserId]?.customer))
        ?.cloneWith();
    final tags = customer?.tags ?? List.empty();

    if (customer != null) {
      return Scaffold(
        appBar: AppBar(
          title: Text(AppLocalizations.of(context)!.customerInformation),
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
                      decoration: InputDecoration(
                        filled: true,
                        icon: const Icon(Icons.person),
                        labelText: "${AppLocalizations.of(context)!.customer}UID",
                      ),
                      initialValue: customer.uid,
                    ),
                    sizedBoxSpace,
                    TextFormField(
                      restorationId: 'name_field',
                      textInputAction: TextInputAction.next,
                      textCapitalization: TextCapitalization.words,
                      decoration: InputDecoration(
                        filled: true,
                        icon: const Icon(Icons.person),
                        hintText: AppLocalizations.of(context)!.pleaseEnterYourName,
                        labelText: AppLocalizations.of(context)!.name,
                      ),
                      initialValue: customer.name,
                      onChanged: (value) {
                        customer.name = value;
                      },
                    ),
                    Column(
                      children: [
                        sizedBoxSpace,
                        ChipsInput<CustomerTag>(
                          decoration: InputDecoration(
                            filled: true,
                            icon: const Icon(Icons.label),
                            labelText: AppLocalizations.of(context)!.customerTag,
                          ),
                          initialValue: tags,
                          // readOnly: true,
                          findSuggestions: (query) {
                            if (tagList != null) {
                              return tagList
                                  .where((element) =>
                                      element.name.startsWith(query))
                                  .toList();
                            }
                            return List.empty();
                          },
                          onChanged: (data) {
                            customer.tags = data;
                          },
                          chipBuilder: (BuildContext context,
                              ChipsInputState<dynamic> state, tag) {
                            return InputChip(
                              key: ObjectKey(tag),
                              label: Text(tag.name),
                              backgroundColor: ColorUtil.fromHex(tag.color),
                              onSelected: (value) {},
                              materialTapTargetSize:
                                  MaterialTapTargetSize.shrinkWrap,
                            );
                          },
                          suggestionBuilder: (context, CustomerTag profile) {
                            return ListTile(
                              key: ObjectKey(profile),
                              title: Text(profile.name),
                              tileColor: ColorUtil.fromHex(profile.color),
                            );
                          },
                        )
                      ],
                    ),
                    sizedBoxSpace,
                    TextFormField(
                      restorationId: 'email_field',
                      textInputAction: TextInputAction.next,
                      textCapitalization: TextCapitalization.words,
                      decoration: InputDecoration(
                        filled: true,
                        icon: const Icon(Icons.email),
                        hintText: AppLocalizations.of(context)!.pleaseEnterEmail,
                        labelText: AppLocalizations.of(context)!.email,
                      ),
                      initialValue: customer.email,
                      onChanged: (value) {
                        customer.email = value;
                      },
                    ),
                    sizedBoxSpace,
                    TextFormField(
                      restorationId: 'mobile_field',
                      textInputAction: TextInputAction.next,
                      textCapitalization: TextCapitalization.words,
                      decoration: InputDecoration(
                        filled: true,
                        icon: const Icon(Icons.phone_android),
                        hintText: AppLocalizations.of(context)!.pleaseEnterYourMobilePhoneNumber,
                        labelText: AppLocalizations.of(context)!.mobile,
                      ),
                      initialValue: customer.mobile,
                      onChanged: (value) {
                        customer.mobile = value;
                      },
                    ),
                    sizedBoxSpace,
                    TextFormField(
                      restorationId: 'address_field',
                      textInputAction: TextInputAction.next,
                      textCapitalization: TextCapitalization.words,
                      decoration: InputDecoration(
                        filled: true,
                        icon: const Icon(Icons.home),
                        hintText: AppLocalizations.of(context)!.pleaseEnterTheCustomerAddress,
                        labelText: AppLocalizations.of(context)!.customerAddress,
                      ),
                      initialValue: customer.address,
                      onChanged: (value) {
                        customer.address = value;
                      },
                    ),
                    sizedBoxSpace,
                    TextFormField(
                      restorationId: 'vip_field',
                      textInputAction: TextInputAction.next,
                      textCapitalization: TextCapitalization.words,
                      keyboardType: TextInputType.number,
                      maxLength: 2,
                      decoration:  InputDecoration(
                        filled: true,
                        icon: const Icon(Icons.star),
                        hintText: AppLocalizations.of(context)!.pleaseEnterTheVipLevel,
                        labelText: AppLocalizations.of(context)!.vipLevel,
                      ),
                      initialValue: customer.vipLevel?.toString(),
                      onChanged: (value) {
                        customer.vipLevel = int.parse(value);
                      },
                    ),
                    sizedBoxSpace,
                    TextFormField(
                      restorationId: 'remarks_field',
                      textInputAction: TextInputAction.next,
                      textCapitalization: TextCapitalization.words,
                      decoration: InputDecoration(
                        filled: true,
                        icon: const Icon(Icons.note),
                        hintText: AppLocalizations.of(context)!.pleaseEnterARemark,
                        labelText: AppLocalizations.of(context)!.remark,
                      ),
                      initialValue: customer.remarks,
                      onChanged: (value) {
                        customer.remarks = value;
                      },
                    ),
                    sizedBoxSpace,
                    ElevatedButton(
                      onPressed: () {
                        // Validate returns true if the form is valid, or false otherwise.
                        if (_formKey.currentState!.validate()) {
                          final customerMap = customer.toJson();
                          customerMap.remove('userId');
                          customerMap.remove('status');
                          updateCustomer
                              .runMutation({"customerInput": customerMap});
                        }
                      },
                      child: Text(AppLocalizations.of(context)!.submit),
                    ),
                  ],
                )),
          ),
        ),
      );
    } else {
      return Text(AppLocalizations.of(context)!.noCustomerInformationWasObtained);
    }
  }
}
