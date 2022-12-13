import 'dart:convert';

import 'package:contact_mobile_client/model/staff.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';

import '../common/globals.dart';
import '../model/customer.dart';
import '../model/message.dart';
import '../model/transfer_message.dart';
import '../model/web_socket_request.dart';
import '../states/state.dart';

class AllStaffStatusGraphql {
  List<Staff>? queryAllStaffStatus;

  AllStaffStatusGraphql({this.queryAllStaffStatus});
}

sendTransferMsg(TransferMessageRequest transferMessage) {
  final content = Content(
      contentType: 'SYS',
      sysCode: 'TRANSFER_REQUEST',
      serviceContent: const JsonEncoder().convert(transferMessage.toJson()));
  final message = Message(
    uuid: uuid.v4(),
    to: transferMessage.toStaffId,
    type: CreatorType.staff,
    creatorType: CreatorType.sys,
    content: content,
  );
  final messageMap = message.toJson();
  messageMap.removeWhere((key, value) => value == null);
  final request = WebSocketRequest.generateRequest(messageMap);
  Globals.socket?.emitWithAck("msg/send", request);
}

class TransferModalWithPageView extends StatefulHookConsumerWidget {
  // const ChatterLogin({super.key});
  const TransferModalWithPageView({Key? key}) : super(key: key);

  @override
  TransferModalWithPageViewState createState() =>
      TransferModalWithPageViewState();
}

class TransferModalWithPageViewState
    extends ConsumerState<TransferModalWithPageView> {
  TransferMessageRequest? transferMessage;
  final remarksTextController = TextEditingController();
  final GlobalKey<FormFieldState> _formFieldKey = GlobalKey<FormFieldState>();

  @override
  void initState() {
    Customer? customer = ref
        .watch(chatStateProvider.select(
            (value) => value.sessionMap[value.chattingUserId]?.customer))
        ?.cloneWith();
    Staff? staff = ref.watch(staffProvider);
    if (customer != null) {
      transferMessage =
          TransferMessageRequest(userId: customer.id, fromStaffId: staff!.id);
    }
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    const sizedBoxSpace = SizedBox(height: 24);
    final staffListResult = useQuery<AllStaffStatusGraphql>(
      QueryOptions(
          document: gql(Staff.queryAllStaffStatus),
          // this is the query string you just created
          // pollInterval: const Duration(seconds: 10),,
          fetchPolicy: FetchPolicy.noCache,
          parserFn: (Map<String, dynamic> map) {
            final staffList = (map["queryAllStaffStatus"] as List?)?.map((e) {
              final staffStatus = StaffStatus.fromJson(e);
              final staff = Staff.fromJson(e["staff"]);
              staff.staffStatus = staffStatus;
              return staff;
            }).toList();
            return AllStaffStatusGraphql(queryAllStaffStatus: staffList);
          }),
    );

    final staffList = staffListResult.result.parsedData?.queryAllStaffStatus;
    return Material(
      child: Scaffold(
        appBar: AppBar(
            leading: Container(),
            title: Text(AppLocalizations.of(context)!.transfer)),
        body: SafeArea(
          bottom: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                key: _formFieldKey,
                restorationId: 'remarks',
                textInputAction: TextInputAction.next,
                textCapitalization: TextCapitalization.words,
                decoration: InputDecoration(
                    filled: true,
                    icon: const Icon(Icons.note_alt),
                    hintText: AppLocalizations.of(context)!.pleaseEnterEmail,
                    labelText: AppLocalizations.of(context)!.email),
                onChanged: (value) {
                  transferMessage?.remarks = value;
                },
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return AppLocalizations.of(context)!
                        .transferReasonIsRequired;
                  } else if (value.length > 300) {
                    return AppLocalizations.of(context)!
                        .transferReasonCannotBeGreaterThan500Characters;
                  }
                  return null;
                },
              ),
              sizedBoxSpace,
              PageView(
                children: List.generate(
                    staffList?.length ?? 0,
                    (index) => ListView(
                          shrinkWrap: true,
                          controller: ModalScrollController.of(context),
                          children: ListTile.divideTiles(
                            context: context,
                            tiles: List.generate(
                                100,
                                (index) => ListTile(
                                      title: Text(staffList![index].realName),
                                      subtitle: Text(
                                          "${staffList[index].staffStatus?.currentServiceCount}/${staffList[index].staffStatus?.maxServiceCount}"),
                                      onTap: () {
                                        // 发送转接消息
                                        if (_formFieldKey.currentState!
                                            .validate()) {
                                          transferMessage!.toStaffId =
                                              staffList[index].id;
                                          sendTransferMsg(transferMessage!);
                                          final transferQuery = TransferQuery(
                                            type: "STAFF",
                                            userId: transferMessage!.userId,
                                            toStaffId:
                                                transferMessage!.toStaffId,
                                            remarks: transferMessage!.remarks!,
                                          );
                                          ref
                                              .read(chatStateProvider.notifier)
                                              .addTransferQuery(transferQuery);
                                        }
                                      },
                                    )),
                          ).toList(),
                        )),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
