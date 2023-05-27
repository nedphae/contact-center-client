import 'package:contact_mobile_client/model/customer.dart';
import 'package:contact_mobile_client/model/staff.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:json_annotation/json_annotation.dart';

import '../common/config.dart';

part 'message.g.dart';

String getPageQuery(String pageName, String content, String contentName) {
  return """
$content
fragment pageOn$pageName on $pageName {
    content {
        ...$contentName
      }
      pageable {
        offset
        pageNumber
        pageSize
        paged
        unpaged
      }
      last
      totalElements
      totalPages
      size
      number
      sort {
        unsorted
        sorted
        empty
      }
      first
      numberOfElements
      empty
    }
""";
}

class MessageBuilder {}

@JsonSerializable()
class Message {
  /// 雪花ID */
  int? seqId;

  /// 服务器接受时间 */
  double? createdAt;

  /// 是否 发送到服务器 */
  bool? sync;
  String uuid;

  /// Snowflake long */
  int? conversationId;

  /// message from, setting by server */
  int? from;

  /// message send to */
  int? to;

  /// Receiver type */
  CreatorType type;

  /// Creator type */
  CreatorType creatorType;
  Content content;
  String? nickname;

  Message(
      {this.seqId,
      this.createdAt,
      this.sync = false,
      required this.uuid,
      this.conversationId,
      this.from,
      this.to,
      required this.type,
      required this.creatorType,
      required this.content,
      this.nickname});

  bool get isSys =>
      creatorType == CreatorType.sys || content.contentType == 'SYS';

  factory Message.fromJson(Map<String, dynamic> json) =>
      _$MessageFromJson(json);

  Map<String, dynamic> toJson() => _$MessageToJson(this);

  types.Message toChatUIMessage(Staff staff, Customer customer) {
    types.Message result;
    final author = creatorType == CreatorType.customer
        ? types.User(
            id: customer.id.toString(),
            role: types.Role.user,
            firstName: customer.name)
        : types.User(
            id: staff.id.toString(),
            role: types.Role.agent,
            firstName: staff.nickname);

    final tempCreatedAt = createdAt == null
        ? DateTime.now().millisecondsSinceEpoch
        : (createdAt! * 1000).toInt();

    final metadata = {"uuid": uuid, "seqId": seqId, "to": to};

    switch (content.contentType) {
      case 'SYS_TEXT':
        result = types.SystemMessage(
          author: author,
          id: uuid,
          remoteId: seqId?.toString(),
          text: content.textContent?.text ?? '',
          createdAt: tempCreatedAt,
          metadata: metadata,
        );
        break;
      case 'TEXT':
        result = types.TextMessage(
          author: author,
          id: uuid,
          remoteId: seqId?.toString(),
          text: content.textContent?.text ?? '',
          createdAt: tempCreatedAt,
          metadata: metadata,
        );
        break;
      case 'IMAGE':
        final imageUrl = "$serverIp${content.photoContent?.mediaId}";
        result = types.ImageMessage(
          author: author,
          id: uuid,
          remoteId: seqId?.toString(),
          uri: imageUrl,
          name: content.photoContent?.filename ?? "",
          size: content.photoContent?.picSize ?? 0,
          createdAt: tempCreatedAt,
          metadata: metadata,
        );
        break;
      case 'FILE':
        final fileUrl = "$serverIp${content.attachments?.mediaId}";
        result = types.FileMessage(
          author: author,
          id: uuid,
          remoteId: seqId?.toString(),
          uri: fileUrl,
          name: content.attachments?.filename ?? "",
          size: content.attachments?.size ?? 0,
          createdAt: tempCreatedAt,
          metadata: metadata,
        );
        break;
      case 'RICH_TEXT':
        result = types.CustomMessage(
          author: author,
          id: uuid,
          remoteId: seqId?.toString(),
          createdAt: tempCreatedAt,
          metadata: {...metadata, "RICH_TEXT": content.textContent?.text},
        );
        break;
      default:
        result = types.TextMessage(
          author: author,
          id: uuid,
          remoteId: seqId?.toString(),
          text: '',
          createdAt: tempCreatedAt,
          metadata: metadata,
        );
        break;
    }
    return result;
  }

  static const contentQuery = """
fragment myMessageContent on Message {
    content {
      contentType
      sysCode
      attachments {
        mediaId
        filename
        size
        type
      }
      photoContent {
        mediaId
        filename
        picSize
        type
      }
      textContent {
        text
      }
    }
    conversationId
    createdAt
    creatorType
    from
    nickname
    organizationId
    seqId
    to
    type
    uuid
  }
""";

  static final loadHistoryMsg = """
${getPageQuery('MessagePage', contentQuery, 'myMessageContent')}
query HistoryMessage(\$userId: Long!, \$cursor: Long, \$limit: Int) {
    loadHistoryMessage(userId: \$userId, cursor: \$cursor, limit: \$limit) {
      ...pageOnMessagePage
    }
  }
""";
}

enum CreatorType {
  /// 系统 */
  @JsonValue(0)
  sys,
  // 客服
  @JsonValue(1)
  staff,
  // 客户
  @JsonValue(2)
  customer,
  // 群聊
  @JsonValue(3)
  group,
}

@JsonSerializable()
class Content {
  // "SYS" | "SYS_TEXT" | "TEXT" | "IMAGE" | "VOICE" | "FILE" | "LINK" | "RICH_TEXT" | "CUSTOMER"
  String contentType;
  String? sysCode;
  String? serviceContent;
  TextContent? textContent;
  PhotoContent? photoContent;

  // 后面再添加附件
  Attachments? attachments;

  Content(
      {required this.contentType,
      this.sysCode,
      this.serviceContent,
      this.textContent,
      this.photoContent,
      this.attachments});

  factory Content.fromJson(Map<String, dynamic> json) =>
      _$ContentFromJson(json);

  Map<String, dynamic> toJson() => _$ContentToJson(this);
}

@JsonSerializable()
class TextContent {
  String text;

  TextContent({required this.text});

  factory TextContent.fromJson(Map<String, dynamic> json) =>
      _$TextContentFromJson(json);

  Map<String, dynamic> toJson() => _$TextContentToJson(this);
}

@JsonSerializable()
class PhotoContent {
  String mediaId;
  String filename;
  int picSize;
  String? type;

  PhotoContent({
    required this.mediaId,
    required this.filename,
    this.picSize = 0,
    this.type,
  });

  factory PhotoContent.fromJson(Map<String, dynamic> json) =>
      _$PhotoContentFromJson(json);

  Map<String, dynamic> toJson() => _$PhotoContentToJson(this);
}

@JsonSerializable()
class Attachments {
  String mediaId;
  String filename;
  int size;
  String? type;

  Attachments({
    required this.mediaId,
    required this.filename,
    this.size = 0,
    this.type,
  });

  factory Attachments.fromJson(Map<String, dynamic> json) =>
      _$AttachmentsFromJson(json);

  Map<String, dynamic> toJson() => _$AttachmentsToJson(this);
}

@JsonSerializable()
class Sort {
  bool unsorted;
  bool sorted;
  bool empty;

  Sort({
    required this.unsorted,
    required this.sorted,
    required this.empty,
  });

  factory Sort.fromJson(Map<String, dynamic> json) => _$SortFromJson(json);

  Map<String, dynamic> toJson() => _$SortToJson(this);
}

@JsonSerializable()
class Pageable {
  Sort? sort;
  int offset;
  int pageNumber;
  int pageSize;
  bool paged;
  bool unpaged;

  Pageable({
    required this.sort,
    required this.offset,
    required this.pageNumber,
    required this.pageSize,
    required this.paged,
    required this.unpaged,
  });

  factory Pageable.fromJson(Map<String, dynamic> json) =>
      _$PageableFromJson(json);

  Map<String, dynamic> toJson() => _$PageableToJson(this);
}

class MessagePageGraphql {
  PageResult? loadHistoryMessage;

  MessagePageGraphql({
    this.loadHistoryMessage,
  });
}

@JsonSerializable()
class PageResult {
  List<dynamic> content;
  Pageable? pageable;
  bool last;
  int totalElements;
  int totalPages;
  int size;
  int number;
  Sort? sort;
  bool first;
  int numberOfElements;
  bool empty;

  PageResult({
    required this.content,
    required this.pageable,
    required this.last,
    required this.totalElements,
    required this.totalPages,
    required this.size,
    required this.number,
    required this.sort,
    required this.first,
    required this.numberOfElements,
    required this.empty,
  });

  factory PageResult.fromJson(Map<String, dynamic> json) =>
      _$PageResultFromJson(json);

  Map<String, dynamic> toJson() => _$PageResultToJson(this);
}

@JsonSerializable()
class UpdateMessage {
  int pts;
  Message message;
  int ptsCount;

  UpdateMessage({
    required this.pts,
    required this.message,
    required this.ptsCount,
  });

  factory UpdateMessage.fromJson(Map<String, dynamic> json) =>
      _$UpdateMessageFromJson(json);

  Map<String, dynamic> toJson() => _$UpdateMessageToJson(this);
}
