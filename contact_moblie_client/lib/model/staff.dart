// import 'dart:typed_data';
import 'package:contact_moblie_client/common/config.dart';
import 'package:graphql_flutter/graphql_flutter.dart' hide JsonSerializable;
import 'package:json_annotation/json_annotation.dart';

part 'staff.g.dart';

@JsonSerializable()
class StaffStatus {
  int staffId;

  // String? groupName;
  OnlineStatus onlineStatus;
  int? maxServiceCount;
  int? currentServiceCount;
  String? priorityOfShunt;
  // Int64List userIdList;
  double loginTime;
  bool syncState;

  StaffStatus({
    required this.staffId,
    this.onlineStatus = OnlineStatus.online,
    required this.maxServiceCount,
    required this.currentServiceCount,
    required this.priorityOfShunt,
    required this.loginTime,
    this.syncState = true,
  });

  factory StaffStatus.fromJson(Map<String, dynamic> json) =>
      _$StaffStatusFromJson(json);
  Map<String, dynamic> toJson() => _$StaffStatusToJson(this);
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

  Staff(
      {required this.organizationId,
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
      required this.enabled});

  factory Staff.fromJson(Map<String, dynamic> json) => _$StaffFromJson(json);
  Map<String, dynamic> toJson() => _$StaffToJson(this);

  // factory Staff.fromJson(Map<String, dynamic> json) {
  //   return Staff(
  //       organizationId: json['organizationId'] as int,
  //       id: json['id'] as int,
  //       groupId: json['groupId'] as int,
  //       role: json['role'] as String,
  //       onlineStatus: OnlineStatus.values[json['onlineStatus'] as int],
  //       maxServiceCount: json['maxServiceCount'] as int,
  //       currentServiceCount: json['currentServiceCount'] as int,
  //       priorityOfShunt: json['priorityOfShunt'] as String,
  //       userIdList: json['userIdList'] as Int64List,
  //       loginTime: json['loginTime'] as double,
  //       staffType: json['staffType'] as int,
  //       realName: json['realName'] as String,
  //       username: json['username'] as String,
  //       nickName: json['nickName'] as String,
  //       gender: json['gender'] as int?,
  //       createTime: json['createTime'] as double,
  //       avatar: json['avatar'] as String?,
  //       personalizedSignature: json['personalizedSignature'] as String?,
  //       syncState: json['syncState'] as bool,
  //       token: json['token'] as String?,
  //       simultaneousService: json['simultaneousService'] as int,
  //       maxTicketPerDay: json['maxTicketPerDay'] as int?,
  //       maxTicketAllTime: json['maxTicketAllTime'] as int?,
  //       mobilePhone: json['mobilePhone'] as String?,
  //       enabled: json['enabled'] as bool);
  // }

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
  @JsonValue(0)
  offline,
  @JsonValue(1)
  online,
  @JsonValue(2)
  busy,
  @JsonValue(3)
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
