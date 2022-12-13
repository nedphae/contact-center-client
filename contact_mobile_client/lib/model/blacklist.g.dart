// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'blacklist.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Blacklist _$BlacklistFromJson(Map<String, dynamic> json) => Blacklist(
      organizationId: json['organizationId'] as int?,
      staffId: json['staffId'] as int?,
      preventStrategy: json['preventStrategy'] as String?,
      preventSource: json['preventSource'] as String?,
      effectiveTime: json['effectiveTime'] as int?,
      failureTime: json['failureTime'] as int?,
      audited: json['audited'] as bool?,
      staffName: json['staffName'] as String?,
    );

Map<String, dynamic> _$BlacklistToJson(Blacklist instance) => <String, dynamic>{
      'organizationId': instance.organizationId,
      'staffId': instance.staffId,
      'preventStrategy': instance.preventStrategy,
      'preventSource': instance.preventSource,
      'effectiveTime': instance.effectiveTime,
      'failureTime': instance.failureTime,
      'audited': instance.audited,
      'staffName': instance.staffName,
    };
