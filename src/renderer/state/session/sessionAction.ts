import { AppDispatch, AppThunk, RootState } from 'renderer/store';
import { createSelector, createAsyncThunk } from '@reduxjs/toolkit';
import { of } from 'rxjs';
import { map, filter, tap, catchError } from 'rxjs/operators';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { WebSocketRequest, generateResponse } from 'renderer/domain/WebSocket';
import { CallBack } from 'renderer/service/websocket/EventInterface';
import {
  Attachments,
  Content,
  Message,
  MessagesMap,
  PhotoContent,
  UpdateMessage,
} from 'renderer/domain/Message';
import {
  Conversation,
  TransferMessageRequest,
  TransferMessageResponse,
  TransferQuery,
} from 'renderer/domain/Conversation';
import { createSession, SessionMap } from 'renderer/domain/Session';
import { getCustomerByUserId } from 'renderer/service/infoService';
import {
  emitMessage,
  filterUndefinedWithCb,
} from 'renderer/service/socketService';
import { CreatorType } from 'renderer/domain/constant/Message';
import { CustomerStatus } from 'renderer/domain/Customer';
import { InteractionLogo } from 'renderer/domain/constant/Conversation';
import apolloClient from 'renderer/utils/apolloClient';
import {
  ConversationIdGraphql,
  ConversationUserIdGraphql,
  MutationTransferToGraphql,
  MUTATION_CONV_TRANSFER,
  QUERY_CONV_BY_ID,
  QUERY_CONV_BY_USERID,
} from 'renderer/domain/graphql/Conversation';
import {
  SyncMsgByStaffGraphql,
  SYNC_MSG_BY_STAFF,
} from 'renderer/domain/graphql/Message';
import slice from './sessionSlice';
import {
  getSelectedSession,
  removeTransferMessageToSend,
  setPlayNewMessageSound,
  setPts,
  setSelectedSessionNumber,
  setSnackbarProp,
  setTransferMessageRecive,
  setTransferMessageToSend,
} from '../chat/chatAction';
import { getMyself } from '../staff/staffAction';

const {
  newConver,
  newMessage,
  unhideSession,
  addNewMessgeBadge,
  hideSelectedSession,
  removeMessageByUUID,
} = slice.actions;
export const {
  updateConverAndCustomer,
  updateConver,
  updateCustomerStatus,
  stickyCustomer,
  tagCustomer,
  updateCustomer,
  addHistoryMessage,
  clearMessgeBadge,
  setHasMore,
  setInteractionLogo,
  setTyping,
  updateSync,
  setStaffDraft,
} = slice.actions;

export const getSessionByUserId = (userId: number) => (state: RootState) =>
  state.session[userId];

function getSessionByHide(session: SessionMap, hide: boolean) {
  return (
    _.values(session)
      .filter((it) => it.hide === hide)
      // 按时间降序
      .sort((a, b) => b.lastMessageTime - a.lastMessageTime)
      // 按置顶排序
      .sort((a, b) => {
        let result = 0;
        if (a.sticky) result -= 1;
        if (b.sticky) result += 1;
        return result;
      })
  );
}

export const setSelectedSession =
  (userId: number | undefined): AppThunk =>
  async (dispatch, getState) => {
    if (userId) {
      const session = getState().session[userId];
      if (session && session.interactionLogo === InteractionLogo.UNREAD) {
        // 未读消息标记已读未回
        dispatch(
          setInteractionLogo({
            userId,
            interactionLogo: InteractionLogo.READ_UNREPLIE,
          })
          );
      }
    }
    dispatch(setSelectedSessionNumber(userId));
  };

const setToLastAndFilter =
  (userId: number): AppThunk =>
  (dispatch, getState) => {
    const list = getSessionByHide(getState().session, false).filter(
      (se) => se.conversation.userId !== userId
      );
    // 设置为等待时间最长的会话
    const last = list[list.length - 1];
    dispatch(setSelectedSession(last?.conversation?.userId));
  };

export const hideSelectedSessionAndSetToLast =
  (): AppThunk => (dispatch, getState) => {
    const userId = getSelectedSession(getState())?.conversation.userId;
    if (userId) {
      dispatch(hideSelectedSession(userId));
      dispatch(setToLastAndFilter(userId));
    }
  };

export const getSelectedMessageList = (state: RootState) => {
  const selected = state.chat.selectedSession;

  let messageList: Message[] = [];
  if (selected) {
    let userMessageMap: MessagesMap | undefined;
    if (state.chat.monitored) {
      if (state.chat.monitored.monitoredMessageList) {
        userMessageMap = state.chat.monitored.monitoredMessageList;
      }
    } else {
      userMessageMap = state.session[selected].massageList;
    }
    if (userMessageMap) {
      messageList = _.values(userMessageMap);
    }
  }

  return messageList.sort(
    (a, b) =>
      // 默认 seqId 为最大
      (a.seqId ?? Number.MAX_SAFE_INTEGER) -
      (b.seqId ?? Number.MAX_SAFE_INTEGER)
  );
};

/**
 * 根据条件获取会话列表，并按照最后消息和置顶排序
 * @param hide 是否是关闭的会话
 */
export const getSession = (hide = false) =>
  createSelector(
    (state: RootState) => state.session,
    (session) => getSessionByHide(session, hide)
  );

export const updateOrCreateConv =
  (conver: Conversation): AppThunk =>
  async (dispatch, getState) => {
    const { userId } = conver;
    if (userId) {
      const session = getState().session[conver.userId];
      // 根据分配的 conversation 获取 user
      const customer = await getCustomerByUserId(userId);
      if (session) {
        // console.info('更新客户对象: %o', customer.status);
        // 更新 newSession
        dispatch(
          updateConverAndCustomer({ conversation: conver, user: customer })
          );
        // 非新会话，要同步
        dispatch(updateSync({ userId: conver.userId, shouldSync: true }));
        if (session.hide) {
          dispatch(unhideSession(conver.userId));
        }
        if (!conver.closeReason && session.conversation.closeReason) {
          dispatch(
            setInteractionLogo({
              userId,
              interactionLogo: InteractionLogo.RECONNECTED,
            })
            );
        }
      } else {
        dispatch(newConver(createSession(conver, customer)));
      }
    }
  };

/**
 * 分配会话
 * @param request websocket 会话信息请求
 * @param cb
 * @returns
 */
export const assignmentConver =
  (request: WebSocketRequest<Conversation>, cb: CallBack<string>): AppThunk =>
  async (dispatch) => {
    const conversation = request.body;
    if (conversation !== undefined) {
      dispatch(updateOrCreateConv(conversation));
      // 设置提示音
      const currentPath = window.location.href;
      if (!currentPath.includes('/entertain') || document.hidden) {
        dispatch(setPlayNewMessageSound());
      }
      cb(generateResponse(request.header, '"OK"'));
    } else {
      cb(generateResponse(request.header, 'request empty', 400));
    }
  };

/**
 * 发送消息到服务器
 * @param message 消息结构
 * @returns callback
 */
export function sendMessage(message: Message): AppThunk {
  return (dispatch, getState) => {
    // 发送消息到服务器
    message.nickName = getState().staff.nickName;
    if (getState().chat.monitored) {
      // 如果是管理员插入的会话
      message.content.sysCode = 'STAFF_HELP';
    }
    emitMessage(message)
      .pipe(
        map((r) => r.body),
        filter((b) => b !== undefined),
        map((mr) => {
          // 设置服务器返回的消息序列号和消息时间
          if (mr !== undefined) {
            message.seqId = mr.seqId;
            message.createdAt = mr.createdAt;
            message.sync = true;
            if (message.to) {
              // 设置 客服已回消息
              dispatch(
                setInteractionLogo({
                  userId: message.to,
                  interactionLogo: InteractionLogo.REPLIED,
                })
              );
            }
          }
          return message;
        }),
        catchError(() => {
          // 如果有错误，设置消息发送失败，显示重发按钮, 并把消息设置到最后
          message.sync = false;
          message.seqId = Number.MAX_SAFE_INTEGER;
          return of(message);
        }),
        map((m) => {
          return { [m.uuid]: m } as MessagesMap;
        })
      )
      .subscribe((messagesMap) => {
        if (!getState().chat.monitored) {
          // 显示消息
          dispatch(newMessage(messagesMap));
        }
      });
  };
}

/**
 * 客服同意转接，调用后台转接会话
 * @param transferQuery 转接参数
 * @returns
 */
export function transferTo(transferQuery: TransferQuery): AppThunk {
  return async (dispatch, getState) => {
    const { data } = await apolloClient.mutate<MutationTransferToGraphql>({
      mutation: MUTATION_CONV_TRANSFER,
      variables: { transferQuery },
    });
    const conversationView = data?.transferTo;
    if (conversationView && conversationView.staffId) {
      const { userId } = conversationView;
      // 获取转接用户对应的会话
      const { conversation } = getSessionByUserId(userId)(getState());
      // 提示转接成功
      dispatch(
        setSnackbarProp({
          open: true,
          message: '转接成功',
          severity: 'success',
        })
      );
      // 延迟3秒更新，防止读取到服务器未更新的会话信息
      setTimeout(async () => {
        // 转接成功 更新会话
        const { data: conv } = await apolloClient.query<ConversationIdGraphql>({
          query: QUERY_CONV_BY_ID,
          variables: {
            id: conversation.id,
          },
        });
        if (conv?.getConversationById) {
          dispatch(updateOrCreateConv(conv?.getConversationById));
          dispatch(
            setInteractionLogo({
              userId,
              interactionLogo: InteractionLogo.TRANSFERED,
            })
          );
        }
        if (getSelectedSession(getState())?.conversation.userId === userId) {
          // 是当前客户就转到其他客户
          dispatch(setToLastAndFilter(userId));
        }
      }, 2000);
    } else {
      // 转接失败
      dispatch(
        setSnackbarProp({
          open: true,
          message: '转接失败，无客服在线或空闲',
          severity: 'error',
        })
      );
    }
  };
}

export function transferToUserId(userId: number): AppThunk {
  return (dispatch, getState) => {
    const { transferMessageToSend } = getState().chat;
    if (transferMessageToSend) {
      const transferQueryList = transferMessageToSend.filter(
        (it) => it.userId === userId
      );
      if (transferQueryList && transferQueryList.length > 0) {
        dispatch(transferTo(transferQueryList[0]));
      }
    }
  };
}

export function sendTransferResponseMsg(
  transferMessageResponse: TransferMessageResponse
): AppThunk {
  return (dispatch) => {
    const content: Content = {
      contentType: 'SYS',
      sysCode: 'TRANSFER_RESPONSE',
      serviceContent: JSON.stringify(transferMessageResponse),
    };
    // 发送转接消息
    const message: Message = {
      uuid: uuidv4().substring(0, 8),
      to: transferMessageResponse.fromStaffId,
      type: CreatorType.STAFF,
      creatorType: CreatorType.SYS,
      content,
    };
    dispatch(sendMessage(message));
  };
}

/**
 * 发送转接消息给指定客服，待客服同意后发送会话
 * @param transferQuery
 * @returns
 */
export function sendTransferMsg(transferQuery: TransferQuery): AppThunk {
  return (dispatch, getState) => {
    const { userId, toStaffId, fromStaffId, remarks } = transferQuery;
    if (toStaffId && remarks) {
      const myStaffId = getMyself(getState()).id;
      const transferMessage: TransferMessageRequest = {
        userId,
        fromStaffId: fromStaffId ?? myStaffId,
        toStaffId,
        remarks,
      };
      const content: Content = {
        contentType: 'SYS',
        sysCode: 'TRANSFER_REQUEST',
        serviceContent: JSON.stringify(transferMessage),
      };
      // 发送转接消息
      const message: Message = {
        uuid: uuidv4().substring(0, 8),
        to: toStaffId,
        type: CreatorType.STAFF,
        creatorType: CreatorType.SYS,
        content,
      };

      // 显示Loadding
      dispatch(
        setSnackbarProp({
          open: true,
          loadding: true,
        })
      );
      dispatch(setTransferMessageToSend(transferQuery));
      dispatch(sendMessage(message));
    }
  };
}

export function sendEvaluationInvitedMsg(userId: number): AppThunk {
  return (dispatch) => {
    const content: Content = {
      contentType: 'SYS',
      sysCode: 'EVALUATION_INVITED',
    };
    // 发送转接消息
    const message: Message = {
      uuid: uuidv4().substring(0, 8),
      to: userId,
      type: CreatorType.CUSTOMER,
      creatorType: CreatorType.SYS,
      content,
    };
    dispatch(sendMessage(message));
  };
}

export function sendWithdrawMsg(
  userId: number,
  serviceContent: { uuid: string; seqId?: number }
): AppThunk {
  return (dispatch) => {
    const content: Content = {
      contentType: 'SYS',
      sysCode: 'WITHDRAW',
      serviceContent: JSON.stringify(serviceContent),
    };
    // 发送转接消息
    const message: Message = {
      uuid: uuidv4().substring(0, 8),
      to: userId,
      type: CreatorType.CUSTOMER,
      creatorType: CreatorType.SYS,
      content,
    };
    dispatch(sendMessage(message));
    dispatch(removeMessageByUUID({ userId, uuid: serviceContent.uuid }));
  };
}

function runSysMsg(message: Message, dispatch: AppDispatch) {
  const { content } = message;
  const serviceMessage = content.serviceContent;
  switch (content.sysCode) {
    case 'ONLINE_STATUS_CHANGED': {
      if (serviceMessage) {
        const sysMsg = JSON.parse(serviceMessage) as CustomerStatus;
        dispatch(updateCustomerStatus(sysMsg));
      }
      break;
    }
    case 'CONV_END': {
      if (serviceMessage) {
        const sysMsg = JSON.parse(serviceMessage) as Conversation;
        dispatch(updateOrCreateConv(sysMsg));
      }
      break;
    }
    case 'CONV_UPDATE': {
      if (serviceMessage) {
        const sysMsg = JSON.parse(serviceMessage) as Conversation;
        dispatch(updateOrCreateConv(sysMsg));
      }
      break;
    }
    case 'TRANSFER_REQUEST': {
      if (serviceMessage) {
        // 请求客服转接消息
        const sysMsg = JSON.parse(serviceMessage) as TransferMessageRequest;
        // 显示转接消息
        dispatch(setTransferMessageRecive(sysMsg));
      }
      break;
    }
    case 'TRANSFER_RESPONSE': {
      if (serviceMessage) {
        // 客服转接响应消息
        const sysMsg = JSON.parse(serviceMessage) as TransferMessageResponse;
        if (sysMsg && sysMsg.userId) {
          // 根据 响应消息判断是否发送转发请求
          if (sysMsg.accept) {
            dispatch(transferToUserId(sysMsg.userId));
          } else {
            // 显示拒绝消息
            dispatch(
              setSnackbarProp({
                open: true,
                message: `转接被拒绝: ${sysMsg.reason}`,
                severity: 'error',
              })
            );
          }
          // 清除转接列表
          dispatch(removeTransferMessageToSend(sysMsg.userId));
        }
      }
      break;
    }
    case 'USER_TYPING': {
      if (serviceMessage && message.from) {
        const userTyping = {
          userId: message.from,
          userTypingText: serviceMessage,
        };
        dispatch(setTyping(userTyping));
      }
      break;
    }
    default:
      break;
  }
}

/**
 * 获取设置服务器发送的消息
 * @param request 消息请求
 * @param cb 回调
 */
export const setNewMessage =
  (request: WebSocketRequest<UpdateMessage>, cb: CallBack<string>): AppThunk =>
  async (dispatch, getState) => {
    of(request)
      .pipe(
        map((r) => r.body),
        filterUndefinedWithCb(request.header, cb),
        tap(() => {
          cb(generateResponse(request.header, '"OK"'));
        }),
        // map((update) => update?.message),
        tap(async (update) => {
          const syncMessageList = [update?.message];
          const localPts = getState().chat.pts;
          if (update?.pts && localPts && update?.pts > localPts) {
            // console.info('丢失消息，进行同步');
            // 根据 pts 检查是否漏接了消息
            const { data } = await apolloClient.query<SyncMsgByStaffGraphql>({
              query: SYNC_MSG_BY_STAFF,
              variables: {
                staffId: getState().staff.id,
                cursor: localPts,
                end: update?.pts,
              },
            });
            if (
              data &&
              data.syncMessageByStaff &&
              data.syncMessageByStaff.content &&
              data.syncMessageByStaff.content.length > 0
            ) {
              syncMessageList.push(...data.syncMessageByStaff.content);
            }
          }
          syncMessageList.forEach(async (m) => {
            if (
              m?.creatorType === CreatorType.SYS ||
              m?.content.contentType === 'SYS'
            ) {
              // 系统消息，解析并执行操作
              runSysMsg(m, dispatch);
            } else {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const end = { [m!.uuid]: m } as MessagesMap;
              const { selectedSession } = getState().chat;
              const userId =
                m?.creatorType === CreatorType.CUSTOMER ? m?.from : m?.to;
              if (userId) {
                const session = getSessionByUserId(userId)(getState());
                if (!session) {
                  // 用户对应会话不存在，重新获取会话
                  const { data: conv } =
                    await apolloClient.query<ConversationUserIdGraphql>({
                      query: QUERY_CONV_BY_USERID,
                      variables: {
                        userId,
                      },
                    });
                  if (conv.getLastConversation) {
                    dispatch(updateOrCreateConv(conv.getLastConversation));
                  }
                }
              }
              if (selectedSession && userId) {
                if (selectedSession !== userId) {
                  // 设置未读消息数
                  dispatch(addNewMessgeBadge(userId));
                  // 设置未读消息状态
                  dispatch(
                    setInteractionLogo({
                      userId,
                      interactionLogo: InteractionLogo.UNREAD,
                    })
                    );
                } else {
                  // 设置已读未回消息状态
                  dispatch(
                    setInteractionLogo({
                      userId,
                      interactionLogo: InteractionLogo.READ_UNREPLIE,
                    })
                    );
                }
              }
              // 设置提示音
              const currentPath = window.location.href;

              if (!currentPath.includes('/entertain') || document.hidden) {
                dispatch(setPlayNewMessageSound());
              }
              dispatch(newMessage(end));
              dispatch(unhideSession(userId));
              if (userId) {
                const userTyping = {
                  userId,
                  userTypingText: undefined,
                };
                dispatch(setTyping(userTyping));
              }
            }
          });
          dispatch(setPts(update?.message?.seqId));
        })
        )
      .subscribe();
  };

/**
 * 发送文本消息到用户
 * @param to 用户ID
 * @param textContent 消息体
 * @returns
 */
export function sendTextMessage(to: number, textContent: string): AppThunk {
  return (dispatch, getState) => {
    const content: Content = {
      contentType: 'TEXT',
      textContent: {
        text: textContent,
      },
    };
    const message: Message = {
      uuid: uuidv4(),
      to,
      type: CreatorType.CUSTOMER,
      creatorType: CreatorType.STAFF,
      content,
      nickName: getState().staff.nickName,
    };
    dispatch(sendMessage(message));
  };
}

export function sendImageMessage(
  to: number,
  photoContent: PhotoContent
): AppThunk {
  return (dispatch, getState) => {
    const content: Content = {
      contentType: 'IMAGE',
      photoContent,
    };
    const message: Message = {
      uuid: uuidv4().substr(0, 8),
      to,
      type: CreatorType.CUSTOMER,
      creatorType: CreatorType.STAFF,
      content,
      nickName: getState().staff.nickName,
    };
    dispatch(sendMessage(message));
  };
}

export function sendFileMessage(
  to: number,
  attachments: Attachments
): AppThunk {
  return (dispatch, getState) => {
    const content: Content = {
      contentType: 'FILE',
      attachments,
    };
    const message: Message = {
      uuid: uuidv4().substr(0, 8),
      to,
      type: CreatorType.CUSTOMER,
      creatorType: CreatorType.STAFF,
      content,
      nickName: getState().staff.nickName,
    };
    dispatch(sendMessage(message));
  };
}
