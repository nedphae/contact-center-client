// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'web_socket_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Header _$HeaderFromJson(Map<String, dynamic> json) => Header(
      mid: json['mid'] as String,
      sid: json['sid'] as String?,
    );

Map<String, dynamic> _$HeaderToJson(Header instance) => <String, dynamic>{
      'mid': instance.mid,
      'sid': instance.sid,
    };

WebSocketRequest _$WebSocketRequestFromJson(Map<String, dynamic> json) =>
    WebSocketRequest(
      header: Header.fromJson(json['header'] as Map<String, dynamic>),
      body: json['body'],
    );

Map<String, dynamic> _$WebSocketRequestToJson(WebSocketRequest instance) =>
    <String, dynamic>{
      'header': instance.header,
      'body': instance.body,
    };

WebSocketResponse _$WebSocketResponseFromJson(Map<String, dynamic> json) =>
    WebSocketResponse(
      header: Header.fromJson(json['header'] as Map<String, dynamic>),
      code: json['code'] as int,
      body: json['body'],
    );

Map<String, dynamic> _$WebSocketResponseToJson(WebSocketResponse instance) =>
    <String, dynamic>{
      'header': instance.header,
      'code': instance.code,
      'body': instance.body,
    };
