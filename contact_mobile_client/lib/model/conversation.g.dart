// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'conversation.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Conversation _$ConversationFromJson(Map<String, dynamic> json) => Conversation(
      id: json['id'] as int,
      organizationId: json['organizationId'] as int,
      fromShuntId: json['fromShuntId'] as int?,
      fromGroupId: json['fromGroupId'] as int?,
      fromIp: json['fromIp'] as String?,
      fromPage: json['fromPage'] as String?,
      fromTitle: json['fromTitle'] as String?,
      fromType: $enumDecode(_$FromTypeEnumMap, json['fromType']),
      inQueueTime: json['inQueueTime'] as int?,
      interaction: json['interaction'] as int?,
      staffId: json['staffId'] as int,
      realName: json['realName'] as String,
      nickname: json['nickname'] as String,
      startTime: (json['startTime'] as num).toDouble(),
      userId: json['userId'] as int,
      uid: json['uid'] as String,
      userName: json['userName'] as String?,
      vipLevel: json['vipLevel'] as int?,
      visitRange: json['visitRange'] as int?,
      transferType: json['transferType'],
      humanTransferSessionId: json['humanTransferSessionId'] as int?,
      transferFromStaffName: json['transferFromStaffName'] as String?,
      transferFromShunt: json['transferFromShunt'] as String?,
      transferRemarks: json['transferRemarks'] as String?,
      isStaffInvited: json['isStaffInvited'] as bool,
      relatedId: json['relatedId'] as int?,
      relatedType: json['relatedType'],
      category: json['category'] as String?,
      categoryDetail: json['categoryDetail'] as String?,
      closeReason: json['closeReason'] as String?,
      endTime: (json['endTime'] as num?)?.toDouble(),
      staffFirstReplyTime: (json['staffFirstReplyTime'] as num?)?.toDouble(),
      firstReplyCost: json['firstReplyCost'] as int?,
      stickDuration: json['stickDuration'] as int?,
      remarks: json['remarks'] as String?,
      status: json['status'] as int?,
      roundNumber: json['roundNumber'] as int,
      clientFirstMessageTime:
          (json['clientFirstMessageTime'] as num?)?.toDouble(),
      avgRespDuration: json['avgRespDuration'] as int?,
      valid: json['valid'] as int?,
      staffMessageCount: json['staffMessageCount'] as int?,
      userMessageCount: json['userMessageCount'] as int?,
      treatedTime: (json['treatedTime'] as num?)?.toDouble(),
      isEvaluationInvited: json['isEvaluationInvited'] as bool?,
      terminator: json['terminator'],
      beginner: json['beginner'],
      region: json['region'] as String?,
      country: json['country'] as String?,
      city: json['city'] as String?,
    );

Map<String, dynamic> _$ConversationToJson(Conversation instance) =>
    <String, dynamic>{
      'id': instance.id,
      'organizationId': instance.organizationId,
      'fromShuntId': instance.fromShuntId,
      'fromGroupId': instance.fromGroupId,
      'fromIp': instance.fromIp,
      'fromPage': instance.fromPage,
      'fromTitle': instance.fromTitle,
      'fromType': _$FromTypeEnumMap[instance.fromType]!,
      'inQueueTime': instance.inQueueTime,
      'interaction': instance.interaction,
      'staffId': instance.staffId,
      'realName': instance.realName,
      'nickname': instance.nickname,
      'startTime': instance.startTime,
      'userId': instance.userId,
      'uid': instance.uid,
      'userName': instance.userName,
      'vipLevel': instance.vipLevel,
      'visitRange': instance.visitRange,
      'transferType': instance.transferType,
      'humanTransferSessionId': instance.humanTransferSessionId,
      'transferFromStaffName': instance.transferFromStaffName,
      'transferFromShunt': instance.transferFromShunt,
      'transferRemarks': instance.transferRemarks,
      'isStaffInvited': instance.isStaffInvited,
      'relatedId': instance.relatedId,
      'relatedType': instance.relatedType,
      'category': instance.category,
      'categoryDetail': instance.categoryDetail,
      'closeReason': instance.closeReason,
      'endTime': instance.endTime,
      'staffFirstReplyTime': instance.staffFirstReplyTime,
      'firstReplyCost': instance.firstReplyCost,
      'stickDuration': instance.stickDuration,
      'remarks': instance.remarks,
      'status': instance.status,
      'roundNumber': instance.roundNumber,
      'clientFirstMessageTime': instance.clientFirstMessageTime,
      'avgRespDuration': instance.avgRespDuration,
      'valid': instance.valid,
      'staffMessageCount': instance.staffMessageCount,
      'userMessageCount': instance.userMessageCount,
      'treatedTime': instance.treatedTime,
      'isEvaluationInvited': instance.isEvaluationInvited,
      'terminator': instance.terminator,
      'beginner': instance.beginner,
      'region': instance.region,
      'country': instance.country,
      'city': instance.city,
    };

const _$FromTypeEnumMap = {
  FromType.web: 'WEB',
  FromType.ios: 'IOS',
  FromType.android: 'ANDROID',
  FromType.wx: 'WX',
  FromType.wxMa: 'WX_MA',
  FromType.wb: 'WB',
  FromType.open: 'OPEN',
};

ConversationView _$ConversationViewFromJson(Map<String, dynamic> json) =>
    ConversationView(
      id: json['id'] as int?,
      organizationId: json['organizationId'] as int?,
      staffId: json['staffId'] as int?,
      userId: json['userId'] as int?,
      shuntId: json['shuntId'] as int?,
      nickname: json['nickname'] as String?,
      interaction: json['interaction'] as int?,
      endTime: json['endTime'] as int?,
      queue: json['queue'] as int?,
      blockOnStaff: json['blockOnStaff'] as int?,
    );

Map<String, dynamic> _$ConversationViewToJson(ConversationView instance) =>
    <String, dynamic>{
      'id': instance.id,
      'organizationId': instance.organizationId,
      'staffId': instance.staffId,
      'userId': instance.userId,
      'shuntId': instance.shuntId,
      'nickname': instance.nickname,
      'interaction': instance.interaction,
      'endTime': instance.endTime,
      'queue': instance.queue,
      'blockOnStaff': instance.blockOnStaff,
    };
