// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'transfer_message.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

TransferMessageRequest _$TransferMessageRequestFromJson(
        Map<String, dynamic> json) =>
    TransferMessageRequest(
      userId: json['userId'] as int,
      fromStaffId: json['fromStaffId'] as int,
      toStaffId: json['toStaffId'] as int?,
      remarks: json['remarks'] as String?,
    );

Map<String, dynamic> _$TransferMessageRequestToJson(
        TransferMessageRequest instance) =>
    <String, dynamic>{
      'userId': instance.userId,
      'fromStaffId': instance.fromStaffId,
      'toStaffId': instance.toStaffId,
      'remarks': instance.remarks,
    };

TransferMessageResponse _$TransferMessageResponseFromJson(
        Map<String, dynamic> json) =>
    TransferMessageResponse(
      userId: json['userId'] as int,
      fromStaffId: json['fromStaffId'] as int,
      toStaffId: json['toStaffId'] as int,
      accept: json['accept'] as bool,
      reason: json['reason'] as String?,
    );

Map<String, dynamic> _$TransferMessageResponseToJson(
        TransferMessageResponse instance) =>
    <String, dynamic>{
      'userId': instance.userId,
      'fromStaffId': instance.fromStaffId,
      'toStaffId': instance.toStaffId,
      'accept': instance.accept,
      'reason': instance.reason,
    };

TransferQuery _$TransferQueryFromJson(Map<String, dynamic> json) =>
    TransferQuery(
      type: json['type'] as String,
      userId: json['userId'] as int?,
      shuntId: json['shuntId'] as int?,
      groupId: json['groupId'] as int?,
      toStaffId: json['toStaffId'] as int?,
      fromStaffId: json['fromStaffId'] as int?,
      remarks: json['remarks'] as String,
    );

Map<String, dynamic> _$TransferQueryToJson(TransferQuery instance) =>
    <String, dynamic>{
      'type': instance.type,
      'userId': instance.userId,
      'shuntId': instance.shuntId,
      'groupId': instance.groupId,
      'toStaffId': instance.toStaffId,
      'fromStaffId': instance.fromStaffId,
      'remarks': instance.remarks,
    };
