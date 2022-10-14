// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'message.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Message _$MessageFromJson(Map<String, dynamic> json) => Message(
      seqId: json['seqId'] as int?,
      createdAt: (json['createdAt'] as num?)?.toDouble(),
      sync: json['sync'] as bool? ?? false,
      uuid: json['uuid'] as String,
      conversationId: json['conversationId'] as int?,
      from: json['from'] as int?,
      to: json['to'] as int?,
      type: $enumDecode(_$CreatorTypeEnumMap, json['type']),
      creatorType: $enumDecode(_$CreatorTypeEnumMap, json['creatorType']),
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
      'type': _$CreatorTypeEnumMap[instance.type]!,
      'creatorType': _$CreatorTypeEnumMap[instance.creatorType]!,
      'content': instance.content,
      'nickName': instance.nickName,
    };

const _$CreatorTypeEnumMap = {
  CreatorType.sys: 0,
  CreatorType.staff: 1,
  CreatorType.customer: 2,
  CreatorType.group: 3,
};

Content _$ContentFromJson(Map<String, dynamic> json) => Content(
      contentType: json['contentType'] as String,
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

Sort _$SortFromJson(Map<String, dynamic> json) => Sort(
      unsorted: json['unsorted'] as bool,
      sorted: json['sorted'] as bool,
      empty: json['empty'] as bool,
    );

Map<String, dynamic> _$SortToJson(Sort instance) => <String, dynamic>{
      'unsorted': instance.unsorted,
      'sorted': instance.sorted,
      'empty': instance.empty,
    };

Pageable _$PageableFromJson(Map<String, dynamic> json) => Pageable(
      sort: json['sort'] == null
          ? null
          : Sort.fromJson(json['sort'] as Map<String, dynamic>),
      offset: json['offset'] as int,
      pageNumber: json['pageNumber'] as int,
      pageSize: json['pageSize'] as int,
      paged: json['paged'] as bool,
      unpaged: json['unpaged'] as bool,
    );

Map<String, dynamic> _$PageableToJson(Pageable instance) => <String, dynamic>{
      'sort': instance.sort,
      'offset': instance.offset,
      'pageNumber': instance.pageNumber,
      'pageSize': instance.pageSize,
      'paged': instance.paged,
      'unpaged': instance.unpaged,
    };

PageResult _$PageResultFromJson(Map<String, dynamic> json) => PageResult(
      content: json['content'] as List<dynamic>,
      pageable: json['pageable'] == null
          ? null
          : Pageable.fromJson(json['pageable'] as Map<String, dynamic>),
      last: json['last'] as bool,
      totalElements: json['totalElements'] as int,
      totalPages: json['totalPages'] as int,
      size: json['size'] as int,
      number: json['number'] as int,
      sort: json['sort'] == null
          ? null
          : Sort.fromJson(json['sort'] as Map<String, dynamic>),
      first: json['first'] as bool,
      numberOfElements: json['numberOfElements'] as int,
      empty: json['empty'] as bool,
    );

Map<String, dynamic> _$PageResultToJson(PageResult instance) =>
    <String, dynamic>{
      'content': instance.content,
      'pageable': instance.pageable,
      'last': instance.last,
      'totalElements': instance.totalElements,
      'totalPages': instance.totalPages,
      'size': instance.size,
      'number': instance.number,
      'sort': instance.sort,
      'first': instance.first,
      'numberOfElements': instance.numberOfElements,
      'empty': instance.empty,
    };

UpdateMessage _$UpdateMessageFromJson(Map<String, dynamic> json) =>
    UpdateMessage(
      pts: json['pts'] as int,
      message: Message.fromJson(json['message'] as Map<String, dynamic>),
      ptsCount: json['ptsCount'] as int,
    );

Map<String, dynamic> _$UpdateMessageToJson(UpdateMessage instance) =>
    <String, dynamic>{
      'pts': instance.pts,
      'message': instance.message,
      'ptsCount': instance.ptsCount,
    };
