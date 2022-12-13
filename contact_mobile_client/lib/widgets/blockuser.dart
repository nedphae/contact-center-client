import 'package:contact_mobile_client/model/blacklist.dart';
import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import '../common/config.dart';
import '../model/customer.dart';
import '../states/state.dart';

class BlockUserBottomSheet extends StatefulHookConsumerWidget {
  const BlockUserBottomSheet({super.key});

  @override
  BlockUserBottomSheetState createState() => BlockUserBottomSheetState();
}

class BlockUserBottomSheetState extends ConsumerState<BlockUserBottomSheet> {
  String? defaultBlockType = "UID";
  double defaultBlockTime = 0;
  final blackList = Blacklist(preventStrategy: "UID");
  Customer? _customer;

  blockUser(Blacklist blackList) async {
    await graphQLClient.mutate(MutationOptions(
        document: gql(Blacklist.mutationSaveBlacklist),
        variables: {
          "blacklist": [blackList]
        }));
  }

  @override
  void initState() {
    _customer = ref
        .watch(chatStateProvider.select(
            (value) => value.sessionMap[value.chattingUserId]?.customer))
        ?.cloneWith();
    blackList.preventSource ??= _customer?.uid;
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    const sizedBoxSpace = SizedBox(height: 24);
    final Map<String, double> blockDuration = {
      AppLocalizations.of(context)!.forever: 0,
      AppLocalizations.of(context)!.halfAnHour: 0.5,
      AppLocalizations.of(context)!.oneHour: 1,
      AppLocalizations.of(context)!.twoHours: 2,
      AppLocalizations.of(context)!.sixHours: 6,
      AppLocalizations.of(context)!.twelveHours: 12,
      AppLocalizations.of(context)!.oneDay: 24,
      AppLocalizations.of(context)!.oneWeek: 24 * 7,
    };
    final Map<String, String> blockListType = {
      AppLocalizations.of(context)!.uid: "UID",
      AppLocalizations.of(context)!.ipAddress: "IP",
    };

    final customer = _customer;
    if (customer != null) {
      return Material(
        child: SafeArea(
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              FormField<String>(
                builder: (FormFieldState<String> state) {
                  return InputDecorator(
                    decoration: InputDecoration(
                        labelStyle: const TextStyle(),
                        errorStyle: const TextStyle(
                            color: Colors.redAccent, fontSize: 16.0),
                        hintText: AppLocalizations.of(context)!.blockListType,
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(5.0))),
                    isEmpty: false,
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: defaultBlockType,
                        isDense: true,
                        onChanged: (String? newValue) {
                          setState(() {
                            defaultBlockType = newValue;
                            blackList.preventStrategy = newValue;
                            blackList.preventSource = newValue == "UID"
                                ? customer.uid
                                : (customer.status?.ip ?? "unknown");
                            state.didChange(newValue);
                          });
                        },
                        items: blockListType.entries
                            .map((MapEntry<String, String> toElement) {
                          return DropdownMenuItem<String>(
                            value: toElement.value,
                            child: Text(toElement.key),
                          );
                        }).toList(),
                      ),
                    ),
                  );
                },
              ),
              sizedBoxSpace,
              FormField<double>(
                builder: (FormFieldState<double> state) {
                  return InputDecorator(
                    decoration: InputDecoration(
                        labelStyle: const TextStyle(),
                        errorStyle: const TextStyle(
                            color: Colors.redAccent, fontSize: 16.0),
                        hintText: AppLocalizations.of(context)!.blockDuration,
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(5.0))),
                    isEmpty: false,
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<double>(
                        value: defaultBlockTime,
                        isDense: true,
                        onChanged: (double? newValue) {
                          if (newValue != null) {
                            final now = DateTime.now().microsecondsSinceEpoch;
                            setState(() {
                              defaultBlockTime = newValue;
                              if (newValue != 0) {
                                blackList.effectiveTime = now;
                                blackList.failureTime =
                                    now + (newValue * 3600000) as int;
                              } else {
                                blackList.effectiveTime = null;
                                blackList.failureTime = null;
                              }
                              state.didChange(newValue);
                            });
                          }
                        },
                        items: blockDuration.entries
                            .map((MapEntry<String, double> toElement) {
                          return DropdownMenuItem<double>(
                            value: toElement.value,
                            child: Text(toElement.key),
                          );
                        }).toList(),
                      ),
                    ),
                  );
                },
              ),
              sizedBoxSpace,
              ElevatedButton(
                onPressed: () {
                  blockUser(blackList);
                  Navigator.of(context).pop();
                },
                child: Text(AppLocalizations.of(context)!.submit),
              ),
            ],
          ),
        ),
      );
    } else {
      return const Material();
    }
  }
}
