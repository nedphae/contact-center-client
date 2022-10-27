import 'package:json_annotation/json_annotation.dart';

part 'customer.g.dart';

@JsonSerializable()
class Customer {
  static const coreCustomerFields = """
  fragment customerFields on Customer {
    organizationId
    userId: id
    id
    uid
    name
    email
    mobile
    address
    vipLevel
    remarks
    status {
      userId
      fromType
      groupId
      ip
      loginTime
      onlineStatus
      referrer
      # robotShuntSwitch
      shuntId
      staffId
      title
      region
      userTrackList {
        url
        title
        enterTime
        updateTime
        awayTime
      }
    }
    data {
      key
      label
      value
      index
      hidden
      href
    }
    tags {
      name
      color
    }
    createdDate
  }
  """;

  static const queryCustomer = """
  $coreCustomerFields
  query Customer(\$userId: Long!) {
    getCustomer(userId: \$userId) {
      ...customerFields
    }
  }
""";

  int id;
  int organizationId;
  int? userId;
  String uid;
  String name;
  String? email;
  String? mobile;
  String? address;
  int? vipLevel;
  String? remarks;
  List<CustomerTag>? tags;
  CustomerStatus status;

  Customer({
    required this.id,
    required this.organizationId,
    this.userId,
    required this.uid,
    required this.name,
    this.email,
    this.mobile,
    this.address,
    this.vipLevel,
    this.remarks,
    this.tags,
    required this.status,
  });

  factory Customer.fromJson(Map<String, dynamic> json) =>
      _$CustomerFromJson(json);

  Map<String, dynamic> toJson() => _$CustomerToJson(this);
}

@JsonSerializable()
class CustomerTag {
  String name;
  String color;

  CustomerTag({
    required this.name,
    required this.color,
  });

  factory CustomerTag.fromJson(Map<String, dynamic> json) =>
      _$CustomerTagFromJson(json);

  Map<String, dynamic> toJson() => _$CustomerTagToJson(this);
}

@JsonSerializable()
class CustomerStatus {
  int userId;
  String fromType;
  int? groupId;
  String? ip;
  double loginTime;
  String onlineStatus;
  String? referrer;
  int shuntId;
  int? staffId;
  String? title;
  String? region;

  CustomerStatus(
      {required this.userId,
      required this.fromType,
      this.groupId,
      this.ip,
      required this.loginTime,
      required this.onlineStatus,
      this.referrer,
      required this.shuntId,
      this.staffId,
      this.title,
      this.region});


  factory CustomerStatus.fromJson(Map<String, dynamic> json) =>
      _$CustomerStatusFromJson(json);

  Map<String, dynamic> toJson() => _$CustomerStatusToJson(this);
}
