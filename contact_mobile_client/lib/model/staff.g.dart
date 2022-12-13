// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'staff.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StaffStatus _$StaffStatusFromJson(Map<String, dynamic> json) => StaffStatus(
      staffId: json['staffId'] as int,
      onlineStatus:
          $enumDecodeNullable(_$OnlineStatusEnumMap, json['onlineStatus']) ??
              OnlineStatus.online,
      maxServiceCount: json['maxServiceCount'] as int?,
      currentServiceCount: json['currentServiceCount'] as int?,
      priorityOfShunt: json['priorityOfShunt'],
      loginTime: (json['loginTime'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$StaffStatusToJson(StaffStatus instance) =>
    <String, dynamic>{
      'staffId': instance.staffId,
      'onlineStatus': _$OnlineStatusEnumMap[instance.onlineStatus],
      'maxServiceCount': instance.maxServiceCount,
      'currentServiceCount': instance.currentServiceCount,
      'priorityOfShunt': instance.priorityOfShunt,
      'loginTime': instance.loginTime,
    };

const _$OnlineStatusEnumMap = {
  OnlineStatus.offline: 'OFFLINE',
  OnlineStatus.online: 'ONLINE',
  OnlineStatus.busy: 'BUSY',
  OnlineStatus.away: 'AWAY',
};

Staff _$StaffFromJson(Map<String, dynamic> json) => Staff(
      organizationId: json['organizationId'] as int,
      id: json['id'] as int,
      groupId: json['groupId'] as int,
      role: json['role'] as String,
      staffType: json['staffType'] as int,
      realName: json['realName'] as String,
      username: json['username'] as String,
      nickName: json['nickName'] as String,
      gender: json['gender'] as int?,
      avatar: json['avatar'] as String?,
      personalizedSignature: json['personalizedSignature'] as String?,
      simultaneousService: json['simultaneousService'] as int,
      maxTicketPerDay: json['maxTicketPerDay'] as int?,
      maxTicketAllTime: json['maxTicketAllTime'] as int?,
      mobilePhone: json['mobilePhone'] as String?,
      enabled: json['enabled'] as bool,
      staffStatus: json['staffStatus'] == null
          ? null
          : StaffStatus.fromJson(json['staffStatus'] as Map<String, dynamic>),
      connected: json['connected'] as bool? ?? false,
    );

Map<String, dynamic> _$StaffToJson(Staff instance) => <String, dynamic>{
      'organizationId': instance.organizationId,
      'id': instance.id,
      'groupId': instance.groupId,
      'role': instance.role,
      'staffType': instance.staffType,
      'realName': instance.realName,
      'username': instance.username,
      'nickName': instance.nickName,
      'gender': instance.gender,
      'avatar': instance.avatar,
      'personalizedSignature': instance.personalizedSignature,
      'simultaneousService': instance.simultaneousService,
      'maxTicketPerDay': instance.maxTicketPerDay,
      'maxTicketAllTime': instance.maxTicketAllTime,
      'mobilePhone': instance.mobilePhone,
      'enabled': instance.enabled,
      'staffStatus': instance.staffStatus,
      'connected': instance.connected,
    };

OauthToken _$OauthTokenFromJson(Map<String, dynamic> json) => OauthToken(
      accessToken: json['access_token'] as String,
      tokenType: json['token_type'] as String,
      refreshToken: json['refresh_token'] as String,
      expiresIn: json['expires_in'] as int,
      scope: json['scope'] as String,
      oid: json['oid'] as int,
      sid: json['sid'] as int,
      jti: json['jti'] as String,
    );

Map<String, dynamic> _$OauthTokenToJson(OauthToken instance) =>
    <String, dynamic>{
      'access_token': instance.accessToken,
      'token_type': instance.tokenType,
      'refresh_token': instance.refreshToken,
      'expires_in': instance.expiresIn,
      'scope': instance.scope,
      'oid': instance.oid,
      'sid': instance.sid,
      'jti': instance.jti,
    };
