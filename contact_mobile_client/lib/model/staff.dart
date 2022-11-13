// import 'dart:typed_data';
import 'package:contact_mobile_client/common/config.dart';
import 'package:graphql_flutter/graphql_flutter.dart' hide JsonSerializable;
import 'package:json_annotation/json_annotation.dart';

part 'staff.g.dart';

@JsonSerializable()
class StaffStatus {
  int staffId;

  // String? groupName;
  OnlineStatus? onlineStatus;
  int? maxServiceCount;
  int? currentServiceCount;
  dynamic priorityOfShunt;
  // Int64List userIdList;
  double? loginTime;

  StaffStatus({
    required this.staffId,
    this.onlineStatus = OnlineStatus.online,
    this.maxServiceCount,
    this.currentServiceCount,
    this.priorityOfShunt,
    this.loginTime,
  });

  factory StaffStatus.fromJson(Map<String, dynamic> json) =>
      _$StaffStatusFromJson(json);
  Map<String, dynamic> toJson() => _$StaffStatusToJson(this);

  static const mutationOnlineStatus = """
  mutation UpdateStaffStatus(\$updateStaffStatus: UpdateStaffStatusInput!) {
    updateStaffStatus(updateStaffStatus: \$updateStaffStatus) {
      autoBusy
      currentServiceCount
      groupId
      loginTime
      maxServiceCount
      organizationId
      priorityOfShunt
      role
      shunt
      staffId
      staffType
      userIdList
      onlineStatus
    }
  }
""";
}

@JsonSerializable()
class Staff {
  int organizationId;
  int id;
  int groupId;
  String role;

  /// 是否是机器人 0 机器人， 1人工
  int staffType;
  String realName;
  String username;
  String nickName;
  int? gender;
  String? avatar;
  String? personalizedSignature;
  int simultaneousService;
  int? maxTicketPerDay;
  int? maxTicketAllTime;
  String? mobilePhone;
  bool enabled;
  // customerList?: CustomerStatus[];
  StaffStatus? staffStatus;
  bool connected;

  Staff({
    required this.organizationId,
    required this.id,
    required this.groupId,
    required this.role,
    required this.staffType,
    required this.realName,
    required this.username,
    required this.nickName,
    this.gender,
    required this.avatar,
    required this.personalizedSignature,
    required this.simultaneousService,
    this.maxTicketPerDay,
    this.maxTicketAllTime,
    this.mobilePhone,
    required this.enabled,
    this.staffStatus,
    this.connected = false,
  });

  factory Staff.fromJson(Map<String, dynamic> json) => _$StaffFromJson(json);
  Map<String, dynamic> toJson() => _$StaffToJson(this);

  Staff cloneWith({
    int? organizationId,
    int? id,
    int? groupId,
    String? role,
    int? staffType,
    String? realName,
    String? username,
    String? nickName,
    int? gender,
    String? avatar,
    String? personalizedSignature,
    int? simultaneousService,
    int? maxTicketPerDay,
    int? maxTicketAllTime,
    String? mobilePhone,
    bool? enabled,
    StaffStatus? staffStatus,
    bool? connected,
  }) =>
      Staff(
        organizationId: organizationId ?? this.organizationId,
        id: id ?? this.id,
        groupId: groupId ?? this.groupId,
        role: role ?? this.role,
        staffType: staffType ?? this.staffType,
        realName: realName ?? this.realName,
        username: username ?? this.username,
        nickName: nickName ?? this.nickName,
        gender: gender ?? this.gender,
        avatar: avatar ?? this.avatar,
        personalizedSignature:
            personalizedSignature ?? this.personalizedSignature,
        simultaneousService: simultaneousService ?? this.simultaneousService,
        maxTicketPerDay: maxTicketPerDay ?? this.maxTicketPerDay,
        maxTicketAllTime: maxTicketAllTime ?? this.maxTicketAllTime,
        mobilePhone: mobilePhone ?? this.mobilePhone,
        enabled: enabled ?? this.enabled,
        staffStatus: staffStatus ?? this.staffStatus,
        connected: connected ?? this.connected,
      );

  static const queryMyInfo = """
fragment staffFields on Staff {
    avatar
    enabled
    gender
    id
    # maxTicketAllTime
    # maxTicketPerDay
    mobilePhone
    nickName
    organizationId
    password
    personalizedSignature
    realName
    role
    simultaneousService
    groupId
    staffType
    username
}
query Staff {
    getMyInfo {
      ...staffFields
    }
  }
""";

  static const offlineClientMutation = """
mutation Staff(\$staffChangeStatus: StaffChangeStatusInput!) {
    offlineClient(staffChangeStatus: \$staffChangeStatus) {
      # 当前先不要返回的状态
    }
  }
""";
}

enum OnlineStatus {
  @JsonValue("OFFLINE")
  offline,
  @JsonValue("ONLINE")
  online,
  @JsonValue("BUSY")
  busy,
  @JsonValue("AWAY")
  away,
}

@JsonSerializable()
class OauthToken {
  @JsonKey(name: 'access_token')
  final String accessToken;
  @JsonKey(name: 'token_type')
  final String tokenType;
  @JsonKey(name: 'refresh_token')
  final String refreshToken;
  @JsonKey(name: 'expires_in')
  final int expiresIn;
  @JsonKey(name: 'scope')
  final String scope;
  @JsonKey(name: 'oid')
  final int oid;
  @JsonKey(name: 'sid')
  final int sid;
  @JsonKey(name: 'jti')
  final String jti;

  const OauthToken({
    required this.accessToken,
    required this.tokenType,
    required this.refreshToken,
    required this.expiresIn,
    required this.scope,
    required this.oid,
    required this.sid,
    required this.jti,
  });

  factory OauthToken.fromJson(Map<String, dynamic> json) =>
      _$OauthTokenFromJson(json);
  Map<String, dynamic> toJson() => _$OauthTokenToJson(this);

  // factory OauthToken.fromJson(Map<String, dynamic> json) {
  //   return OauthToken(
  //     accessToken: json['access_token'] as String,
  //     tokenType: json['token_type'] as String,
  //     refreshToken: json['refresh_token'] as String,
  //     expiresIn: json['expires_in'] as int,
  //     scope: json['scope'] as String,
  //     oid: json['oid'] as int,
  //     sid: json['sid'] as int,
  //     jti: json['jti'] as String,
  //   );
  // }
}

Future<Staff?> getStaffInfo() async {
  var res =
      await graphQLClient.query(QueryOptions(document: gql(Staff.queryMyInfo)));
  final staffMap = res.data?['getMyInfo'];
  if (staffMap != null) {
    return Staff.fromJson(staffMap);
  }
  return null;
}
