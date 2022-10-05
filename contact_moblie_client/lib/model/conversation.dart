import 'package:contact_moblie_client/model/customer.dart';
import 'package:contact_moblie_client/model/message.dart';

class Conversation {
  static const conversationFields = """
  fragment conversationFields on Conversation {
    avgRespDuration
    beginner
    category
    categoryDetail
    clientFirstMessageTime
    closeReason
    convType
    endTime
    evaluate {
      evaluation
      evaluationRemark
      evaluationType
      userResolvedStatus
    }
    firstReplyCost
    fromGroupId
    fromGroupName
    fromIp
    fromPage
    fromShuntId
    fromShuntName
    fromTitle
    fromType
    humanTransferSessionId
    id
    inQueueTime
    interaction
    isEvaluationInvited
    isStaffInvited
    valid
    nickName
    organizationId
    realName
    relatedId
    relatedType
    remarks
    roundNumber
    staffFirstReplyTime
    staffId
    staffMessageCount
    startTime
    status
    stickDuration
    terminator
    totalMessageCount
    transferFromShunt
    transferFromStaffName
    transferRemarks
    transferType
    treatedTime
    userId
    userMessageCount
    userName
    vipLevel
    visitRange
  }
""";
  static const queryConv = """
$conversationFields
query Conversation {
    # staffId为空 获取当前客服的在线会话
    onlineConversationByStaffId(staffId: null) {
      ...conversationFields
    }
  }
""";

  int id;
  int organizationId;

  /// 接待组id */
  int? fromShuntId;
  int? fromGroupId;
  String? fromIp;
  String? fromPage;
  String? fromTitle;

  /// 来源类型 */
  FromType fromType;
  int? inQueueTime;
  int? interaction;
// ConversationType? cType;
  int staffId;
  String realName;
  String nickName;
  int startTime;
  int userId;
  String uid;
  String? userName;
  int vipLevel;

  /// 来访时间差，单位毫秒
  int? visitRange;
  int? transferType;
  int? humanTransferSessionId;
  String? transferFromStaffName;
  int? transferFromShunt;
  String? transferRemarks;
  bool isStaffInvited;
  int relatedId;
  int relatedType;
  String? category;
  String? categoryDetail;
  String? closeReason;
  int? endTime;
// Object? evaluate;
  int? staffFirstReplyTime;
  int? firstReplyCost;
  int? stickDuration;
  String? remarks;
  int? status;
  int roundNumber;
  int? clientFirstMessageTime;
  int? avgRespDuration;
  int? valid;
  int? staffMessageCount;
  int? userMessageCount;
  int? treatedTime;
  bool? isEvaluationInvited;
  String? terminator;
  String? beginner;
  String? region;
  String? country;
  String? city;

  Conversation(
      {required this.id,
      required this.organizationId,
      this.fromShuntId,
      this.fromGroupId,
      this.fromIp,
      this.fromPage,
      this.fromTitle,
      required this.fromType,
      this.inQueueTime,
      this.interaction,
      required this.staffId,
      required this.realName,
      required this.nickName,
      required this.startTime,
      required this.userId,
      required this.uid,
      this.userName,
      required this.vipLevel,
      required this.visitRange,
      required this.transferType,
      required this.humanTransferSessionId,
      required this.transferFromStaffName,
      required this.transferFromShunt,
      required this.transferRemarks,
      required this.isStaffInvited,
      required this.relatedId,
      required this.relatedType,
      required this.category,
      required this.categoryDetail,
      required this.closeReason,
      required this.endTime,
      // required this.evaluate,
      required this.staffFirstReplyTime,
      required this.firstReplyCost,
      required this.stickDuration,
      required this.remarks,
      required this.status,
      required this.roundNumber,
      required this.clientFirstMessageTime,
      required this.avgRespDuration,
      required this.valid,
      required this.staffMessageCount,
      required this.userMessageCount,
      required this.treatedTime,
      required this.isEvaluationInvited,
      required this.terminator,
      required this.beginner,
      required this.region,
      required this.country,
      required this.city});

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['id'] as int,
      organizationId: json['organizationId'] as int,
      fromShuntId: json['fromShuntId'] as int?,
      fromGroupId: json['fromGroupId'] as int?,
      fromIp: json['fromIp'] as String?,
      fromPage: json['fromPage'] as String?,
      fromTitle: json['fromTitle'] as String?,
      fromType: FromType.values[json['fromType'] as int],
      inQueueTime: json['inQueueTime'] as int?,
      interaction: json['interaction'] as int?,
      staffId: json['staffId'] as int,
      realName: json['realName'] as String,
      nickName: json['nickName'] as String,
      startTime: json['startTime'] as int,
      userId: json['userId'] as int,
      uid: json['uid'] as String,
      userName: json['userName'] as String,
      vipLevel: json['vipLevel'] as int,
      visitRange: json['visitRange'] as int?,
      transferType: json['transferType'] as int?,
      humanTransferSessionId: json['humanTransferSessionId'] as int?,
      transferFromStaffName: json['transferFromStaffName'] as String?,
      transferFromShunt: json['transferFromShunt'] as int?,
      transferRemarks: json['transferRemarks'] as String?,
      isStaffInvited: json['isStaffInvited'] as bool,
      relatedId: json['relatedId'] as int,
      relatedType: json['relatedType'] as int,
      category: json['category'] as String?,
      categoryDetail: json['categoryDetail'] as String?,
      closeReason: json['closeReason'] as String?,
      endTime: json['endTime'] as int?,
      // evaluate: json['evaluate'] as int?,
      staffFirstReplyTime: json['staffFirstReplyTime'] as int,
      firstReplyCost: json['firstReplyCost'] as int,
      stickDuration: json['stickDuration'] as int,
      remarks: json['remarks'] as String?,
      status: json['status'] as int,
      roundNumber: json['roundNumber'] as int,
      clientFirstMessageTime: json['clientFirstMessageTime'] as int,
      avgRespDuration: json['avgRespDuration'] as int,
      valid: json['valid'] as int,
      staffMessageCount: json['staffMessageCount'] as int,
      userMessageCount: json['userMessageCount'] as int,
      treatedTime: json['treatedTime'] as int,
      isEvaluationInvited: json['isEvaluationInvited'] as bool?,
      terminator: json['terminator'] as String?,
      beginner: json['beginner'] as String?,
      region: json['region'] as String?,
      country: json['country'] as String?,
      city: json['city'] as String?,
    );
  }
}

enum FromType {
  /// web */
  web,

  /// ios */
  ios,

  /// android */
  android,

  /// 微信 */
  wx,

  /// 微信小程序 */
  wxMa,

  /// 微博 */
  wb,

  /// 开放接口 */
  open,
}

class Session {
  // 会话信息
  Conversation conversation;
  // 客户信息
  Customer customer;
  // 未读
  int unread;
  // 会话消息
  List<Message> messageaList;
  // 最新的消息
  Message? lastMessage;

  bool hide;

  Session({
    required this.conversation,
    required this.customer,
    this.unread = 0,
    required this.messageaList,
    this.hide = false,
  });
}

