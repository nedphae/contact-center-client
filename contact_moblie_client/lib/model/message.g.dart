// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'message.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Message _$MessageFromJson(Map<String, dynamic> json) => Message(
      seqId: json['seqId'] as int?,
      createdAt: json['createdAt'] as int?,
      sync: json['sync'] as bool? ?? false,
      uuid: json['uuid'] as String,
      conversationId: json['conversationId'] as int?,
      from: json['from'] as int?,
      to: json['to'] as int?,
      type: json['type'] as String,
      creatorType: json['creatorType'] as String,
      content: Content.fromJson(json['content'] as Map<String, dynamic>),
      nickName: json['nickName'] as String?,
    );

Map<String, dynamic> _$MessageToJson(Message instance) => <String, dynamic>{
      'seqId': instance.seqId,
      'createdAt': instance.createdAt,
      'sync': instance.sync,
      'uuid': instance.uuid,
      'conversationId': instance.conversationId,
      'from': instance.from,
      'to': instance.to,
      'type': instance.type,
      'creatorType': instance.creatorType,
      'content': instance.content,
      'nickName': instance.nickName,
    };

Content _$ContentFromJson(Map<String, dynamic> json) => Content(
      contentType: json['contentType'] as String?,
      sysCode: json['sysCode'] as String?,
      serviceContent: json['serviceContent'] as String?,
      textContent: json['textContent'] == null
          ? null
          : TextContent.fromJson(json['textContent'] as Map<String, dynamic>),
      photoContent: json['photoContent'] == null
          ? null
          : PhotoContent.fromJson(json['photoContent'] as Map<String, dynamic>),
      attachments: json['attachments'],
    );

Map<String, dynamic> _$ContentToJson(Content instance) => <String, dynamic>{
      'contentType': instance.contentType,
      'sysCode': instance.sysCode,
      'serviceContent': instance.serviceContent,
      'textContent': instance.textContent,
      'photoContent': instance.photoContent,
      'attachments': instance.attachments,
    };

TextContent _$TextContentFromJson(Map<String, dynamic> json) => TextContent(
      text: json['text'] as String,
    );

Map<String, dynamic> _$TextContentToJson(TextContent instance) =>
    <String, dynamic>{
      'text': instance.text,
    };

PhotoContent _$PhotoContentFromJson(Map<String, dynamic> json) => PhotoContent(
      mediaId: json['mediaId'] as String,
      filename: json['filename'] as String,
      picSize: json['picSize'] as int? ?? 0,
      type: json['type'] as String,
    );

Map<String, dynamic> _$PhotoContentToJson(PhotoContent instance) =>
    <String, dynamic>{
      'mediaId': instance.mediaId,
      'filename': instance.filename,
      'picSize': instance.picSize,
      'type': instance.type,
    };
