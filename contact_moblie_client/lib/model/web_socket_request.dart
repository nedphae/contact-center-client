import 'package:json_annotation/json_annotation.dart';
import 'package:uuid/uuid.dart';

part 'web_socket_request.g.dart';

const uuid = Uuid();

@JsonSerializable()
class Header {
  String mid;
  String? sid;

  Header({
    required this.mid,
    this.sid,
  });

  factory Header.fromJson(Map<String, dynamic> json) => _$HeaderFromJson(json);
  Map<String, dynamic> toJson() => _$HeaderToJson(this);
}

@JsonSerializable()
class WebSocketRequest {
  Header header;
  // map 格式，调用类的 fromJson 转换
  dynamic body;

  WebSocketRequest({required this.header, this.body});

  factory WebSocketRequest.fromJson(Map<String, dynamic> json) =>
      _$WebSocketRequestFromJson(json);
  Map<String, dynamic> toJson() => _$WebSocketRequestToJson(this);

  factory WebSocketRequest.generateRequest(body) {
    final mid = uuid.v4().substring(0, 8);
    final header = Header(mid: mid);
    return WebSocketRequest(header: header, body: body);
  }
}

@JsonSerializable()
class WebSocketResponse {
  Header header;
  int code;
  dynamic body;

  WebSocketResponse({required this.header, required this.code, this.body});

  factory WebSocketResponse.fromJson(Map<String, dynamic> json) =>
      _$WebSocketResponseFromJson(json);
  Map<String, dynamic> toJson() => _$WebSocketResponseToJson(this);
}
