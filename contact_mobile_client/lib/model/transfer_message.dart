import 'package:json_annotation/json_annotation.dart';

part 'transfer_message.g.dart';

@JsonSerializable()
class TransferMessageRequest {
  int userId;
  int fromStaffId;
  int? toStaffId;
  String? remarks;

  TransferMessageRequest({
    required this.userId,
    required this.fromStaffId,
    this.toStaffId,
    this.remarks,
  });

  factory TransferMessageRequest.fromJson(Map<String, dynamic> json) =>
      _$TransferMessageRequestFromJson(json);

  Map<String, dynamic> toJson() => _$TransferMessageRequestToJson(this);
}

@JsonSerializable()
class TransferMessageResponse {
  int userId;
  int fromStaffId;
  int toStaffId;
  bool accept;
  String? reason;

  TransferMessageResponse({
    required this.userId,
    required this.fromStaffId,
    required this.toStaffId,
    required this.accept,
    this.reason,
  });

  factory TransferMessageResponse.fromJson(Map<String, dynamic> json) =>
      _$TransferMessageResponseFromJson(json);

  Map<String, dynamic> toJson() => _$TransferMessageResponseToJson(this);
}

@JsonSerializable()
class TransferQuery {
  String type;
  int? userId;
  int? shuntId;
  int? groupId;
  int? toStaffId;
  int? fromStaffId;
  String remarks;

  TransferQuery({
    required this.type,
    this.userId,
    this.shuntId,
    this.groupId,
    this.toStaffId,
    this.fromStaffId,
    required this.remarks,
  });

  factory TransferQuery.fromJson(Map<String, dynamic> json) =>
      _$TransferQueryFromJson(json);

  Map<String, dynamic> toJson() => _$TransferQueryToJson(this);

  static const mutationConvTransfer = '''
  mutation ConversationView(\$transferQuery: TransferQueryInput!) {
    transferTo(transferQuery: \$transferQuery) {
      id
      organizationId
      staffId
      userId
      shuntId
      nickname
      interaction
      endTime
      queue
      blockOnStaff
    }
  }
''';
}
