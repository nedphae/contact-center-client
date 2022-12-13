import 'package:json_annotation/json_annotation.dart';

part 'blacklist.g.dart';

@JsonSerializable()
class Blacklist {
  int? organizationId;
  int? staffId;
  String? preventStrategy;
  String? preventSource;
  int? effectiveTime;
  int? failureTime;
  bool? audited;
  String? staffName;

  Blacklist({
    this.organizationId,
    this.staffId,
    this.preventStrategy,
    this.preventSource,
    this.effectiveTime,
    this.failureTime,
    this.audited,
    this.staffName,
  });

  factory Blacklist.fromJson(Map<String, dynamic> json) =>
      _$BlacklistFromJson(json);

  Map<String, dynamic> toJson() => _$BlacklistToJson(this);

  static const mutationSaveBlacklist = """
  mutation Blacklist(\$blacklist: [BlacklistInput!]!) {
    saveBlacklist(blacklist: \$blacklist) {
      id
    organizationId
    staffId
    preventStrategy
    preventSource
    effectiveTime
    failureTime
    audited
    }
  }
""";
}
