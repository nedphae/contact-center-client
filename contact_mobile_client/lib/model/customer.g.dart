// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Customer _$CustomerFromJson(Map<String, dynamic> json) => Customer(
      id: json['id'] as int,
      organizationId: json['organizationId'] as int,
      userId: json['userId'] as int?,
      uid: json['uid'] as String,
      name: json['name'] as String,
      email: json['email'] as String?,
      mobile: json['mobile'] as String?,
      address: json['address'] as String?,
      vipLevel: json['vipLevel'] as int?,
      remarks: json['remarks'] as String?,
      tags: (json['tags'] as List<dynamic>?)
          ?.map((e) => CustomerTag.fromJson(e as Map<String, dynamic>))
          .toList(),
      status: CustomerStatus.fromJson(json['status'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$CustomerToJson(Customer instance) => <String, dynamic>{
      'id': instance.id,
      'organizationId': instance.organizationId,
      'userId': instance.userId,
      'uid': instance.uid,
      'name': instance.name,
      'email': instance.email,
      'mobile': instance.mobile,
      'address': instance.address,
      'vipLevel': instance.vipLevel,
      'remarks': instance.remarks,
      'tags': instance.tags,
      'status': instance.status,
    };

CustomerTag _$CustomerTagFromJson(Map<String, dynamic> json) => CustomerTag(
      name: json['name'] as String,
      color: json['color'] as String,
    );

Map<String, dynamic> _$CustomerTagToJson(CustomerTag instance) =>
    <String, dynamic>{
      'name': instance.name,
      'color': instance.color,
    };

CustomerStatus _$CustomerStatusFromJson(Map<String, dynamic> json) =>
    CustomerStatus(
      userId: json['userId'] as int,
      fromType: json['fromType'] as String,
      groupId: json['groupId'] as int?,
      ip: json['ip'] as String?,
      loginTime: (json['loginTime'] as num).toDouble(),
      onlineStatus: json['onlineStatus'] as String,
      referrer: json['referrer'] as String?,
      shuntId: json['shuntId'] as int,
      staffId: json['staffId'] as int?,
      title: json['title'] as String?,
      region: json['region'] as String?,
    );

Map<String, dynamic> _$CustomerStatusToJson(CustomerStatus instance) =>
    <String, dynamic>{
      'userId': instance.userId,
      'fromType': instance.fromType,
      'groupId': instance.groupId,
      'ip': instance.ip,
      'loginTime': instance.loginTime,
      'onlineStatus': instance.onlineStatus,
      'referrer': instance.referrer,
      'shuntId': instance.shuntId,
      'staffId': instance.staffId,
      'title': instance.title,
      'region': instance.region,
    };
