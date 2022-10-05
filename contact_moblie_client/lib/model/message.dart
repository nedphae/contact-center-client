import 'package:json_annotation/json_annotation.dart';

part 'message.g.dart';

@JsonSerializable()
class Message {
  /// 雪花ID */
  int? seqId;

  /// 服务器接受时间 */
  int? createdAt;

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
  String type;

  /// Creator type */
  String creatorType;
  Content content;
  String? nickName;

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
      this.nickName});

  factory Message.fromJson(Map<String, dynamic> json) =>
      _$MessageFromJson(json);
  Map<String, dynamic> toJson() => _$MessageToJson(this);
}

@JsonSerializable()
class Content {
  String? contentType;
  String? sysCode;
  String? serviceContent;
  TextContent? textContent;
  PhotoContent? photoContent;
  // 后面再添加附件
  dynamic attachments;

  Content(
      {this.contentType,
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
  String type;

  PhotoContent({
    required this.mediaId,
    required this.filename,
    this.picSize = 0,
    required this.type,
  });

  factory PhotoContent.fromJson(Map<String, dynamic> json) =>
      _$PhotoContentFromJson(json);
  Map<String, dynamic> toJson() => _$PhotoContentToJson(this);
}
