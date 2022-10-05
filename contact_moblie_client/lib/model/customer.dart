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

  Customer({
    required this.id,
    required this.organizationId,
    this.userId,
    required this.uid,
    required this.name,
  });

  factory Customer.fromJson(Map<String, dynamic> json) =>
      _$CustomerFromJson(json);
  Map<String, dynamic> toJson() => _$CustomerToJson(this);
}
