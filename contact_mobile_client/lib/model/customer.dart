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
  final String uid;
  String name;
  String? email;
  String? mobile;
  String? address;
  int? vipLevel;
  String? remarks;
  List<CustomerTag>? tags;
  double? createdDate;
  CustomerStatus? status;

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
    this.createdDate,
    this.status,
  });

  factory Customer.fromJson(Map<String, dynamic> json) =>
      _$CustomerFromJson(json);

  Map<String, dynamic> toJson() => _$CustomerToJson(this);

  Customer cloneWith({
    int? id,
    int? organizationId,
    int? userId,
    String? uid,
    String? name,
    String? email,
    String? mobile,
    String? address,
    int? vipLevel,
    String? remarks,
    List<CustomerTag>? tags,
    double? createdDate,
    CustomerStatus? status,
  }) =>
      Customer(
        id: id ?? this.id,
        organizationId: organizationId ?? this.organizationId,
        userId: userId ?? this.userId,
        uid: uid ?? this.uid,
        name: name ?? this.name,
        email: email ?? this.email,
        mobile: mobile ?? this.mobile,
        address: address ?? this.address,
        vipLevel: vipLevel ?? this.vipLevel,
        remarks: remarks ?? this.remarks,
        tags: tags ?? this.tags,
        createdDate: createdDate ?? this.createdDate,
        status: status ?? this.status,
      );

  static const updateCustomer = """
  $coreCustomerFields
  mutation Customer(\$customerInput: CustomerInput!) {
    updateCustomer(customer: \$customerInput) {
      ...customerFields
    }
  }
""";
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

  static const queryCustomerTag = """
   query CustomerTag {
    getAllCustomerTag {
      id
      name
      color
    }
  }
  """;
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
