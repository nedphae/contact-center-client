import 'dart:typed_data';

class Staff {
  int organizationId;
  int id;
  int groupId;
  // String? groupName;
  String role;
  OnlineStatus onlineStatus;
  int maxServiceCount;
  int currentServiceCount;
  String priorityOfShunt;
  Int64List userIdList;
  double loginTime;

  /// 是否是机器人 0 机器人， 1人工
  int staffType;
  String realName;
  String username;
  String nickName;
  int? gender;
  double createTime;
  String? avatar;
  String? personalizedSignature;
  bool syncState;
  String? token;
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
      required this.onlineStatus,
      required this.maxServiceCount,
      required this.currentServiceCount,
      required this.priorityOfShunt,
      required this.userIdList,
      required this.loginTime,
      required this.staffType,
      required this.realName,
      required this.username,
      required this.nickName,
      this.gender,
      required this.createTime,
      required this.avatar,
      required this.personalizedSignature,
      required this.syncState,
      this.token,
      required this.simultaneousService,
      this.maxTicketPerDay,
      this.maxTicketAllTime,
      this.mobilePhone,
      required this.enabled});

  factory Staff.fromJson(Map<String, dynamic> json) {
    return Staff(
        organizationId: json['organizationId'] as int,
        id: json['id'] as int,
        groupId: json['groupId'] as int,
        role: json['role'] as String,
        onlineStatus: OnlineStatus.values[json['onlineStatus'] as int],
        maxServiceCount: json['maxServiceCount'] as int,
        currentServiceCount: json['currentServiceCount'] as int,
        priorityOfShunt: json['priorityOfShunt'] as String,
        userIdList: json['userIdList'] as Int64List,
        loginTime: json['loginTime'] as double,
        staffType: json['staffType'] as int,
        realName: json['realName'] as String,
        username: json['username'] as String,
        nickName: json['nickName'] as String,
        gender: json['gender'] as int?,
        createTime: json['createTime'] as double,
        avatar: json['avatar'] as String?,
        personalizedSignature: json['personalizedSignature'] as String?,
        syncState: json['syncState'] as bool,
        token: json['token'] as String?,
        simultaneousService: json['simultaneousService'] as int,
        maxTicketPerDay: json['maxTicketPerDay'] as int?,
        maxTicketAllTime: json['maxTicketAllTime'] as int?,
        mobilePhone: json['mobilePhone'] as String?,
        enabled: json['enabled'] as bool);
  }

}

enum OnlineStatus {
  offline,
  online,
  busy,
  away,
}

class OauthToken {
  final String accessToken;
  final String tokenType;
  final String refreshToken;
  final int expiresIn;
  final String scope;
  final int oid;
  final int sid;
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

  factory OauthToken.fromJson(Map<String, dynamic> json) {
    return OauthToken(
      accessToken: json['access_token'] as String,
      tokenType: json['token_type'] as String,
      refreshToken: json['refresh_token'] as String,
      expiresIn: json['expires_in'] as int,
      scope: json['scope'] as String,
      oid: json['oid'] as int,
      sid: json['sid'] as int,
      jti: json['jti'] as String,
    );
  }
}
