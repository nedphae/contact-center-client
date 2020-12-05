import IO from "socket.io-client";
import platform from "platform";

import config from "src/config/client";
import store from "src/chat/state/store";
import {
  guest,
  getDefaultGroupHistoryMessages,
  loginByToken,
  getLinkmansLastMessages,
  getLinkmanHistoryMessages
} from "src/chat/service";
import {
  ActionTypes,
  SetLinkmanPropertyPayload,
  AddLinkmanHistoryMessagesPayload,
  AddLinkmanMessagePayload,
  DeleteMessagePayload
} from "src/chat/state/action";
import convertMessage from "src/utils/convertMessage";
import getFriendId from "src/utils/getFriendId";
import notification from "src/utils/notification";
import playSound from "src/utils/playSound";
import { Message, Linkman } from "src/chat/state/reducer";
import voice from "src/utils/voice";


let socket: SocketIOClient.Socket | null

function socketConnect(token: string | null = null) {
  if (token && socket) {
    // 如果有 新 token，重新连接
    socket.disconnect()
    socket = null
  }

  if (socket) {
    return socket
  }

  const { dispatch } = store;

  const options: SocketIOClient.ConnectOpts = token ? {
    // reconnectionDelay: 1000,
    // 传递的参数，TODO 传递 JWT Token
    // 基于 socketio-jwt 包的认证，后期调研
    // 使用 连接参数 可以方便的保存的握手数据中
    // see https://stackoverflow.com/questions/36788831/authenticating-socket-io-connections-using-jwt?newreg=215d38e39d5c4f6e94ba1cb6b89a7388
    query: {
      //   // jwt token
      token: token
    },
  } : {};
  if (token) {
    options.reconnection = true
  }else {
    options.reconnection = false
  }

  
  socket = IO(config.server, options);

  socket.on('connect_error', (error: Object) => {
    // token 验证错误
    // 超时等
    console.info(error)
  });

  async function loginFailback() {
    if (platform.os?.family && platform.name && platform.description) {
      const defaultGroup = await guest(
        platform.os.family,
        platform.name,
        platform.description
      );
      if (defaultGroup) {
        dispatch({
          type: ActionTypes.SetGuest,
          payload: defaultGroup
        });
        const messages = await getDefaultGroupHistoryMessages(0);
        messages.forEach(convertMessage);
        dispatch({
          type: ActionTypes.AddLinkmanHistoryMessages,
          payload: {
            linkmanId: defaultGroup._id,
            messages
          }
        });
      }
    }
  }

  socket.on("connect", async () => {
    dispatch({ type: ActionTypes.Connect, payload: null });

    const token = window.localStorage.getItem("token");
    if (token) {
      const user = await loginByToken(
        token,
        platform.os?.family as string,
        platform.name as string,
        platform.description as string
      );
      if (user) {
        dispatch({
          type: ActionTypes.SetUser,
          payload: user
        });
        const linkmanIds = [
          ...user.groups.map((group: { _id: any; }) => group._id),
          ...user.friends.map((friend: { from: string; to: { _id: string; }; }) => getFriendId(friend.from, friend.to._id))
        ];
        const linkmanMessages = await getLinkmansLastMessages(linkmanIds);
        Object.values(linkmanMessages as Message).forEach((messages: Message[]) =>
          messages.forEach(convertMessage)
        );
        dispatch({
          type: ActionTypes.SetLinkmansLastMessages,
          payload: linkmanMessages
        });
        return null;
      }
    }
    loginFailback();
    return null;
  });

  socket.on("disconnect", () => {
    dispatch({ type: ActionTypes.Disconnect, payload: null });
  });

  let windowStatus = "focus";
  window.onfocus = () => {
    windowStatus = "focus";
  };
  window.onblur = () => {
    windowStatus = "blur";
  };

  let prevFrom: string | null = "";
  let prevName = "";
  socket.on("message", async (message: Message) => {
    convertMessage(message);

    const state = store.getState();
    const isSelfMessage = message.from._id === state.user!._id;
    if (isSelfMessage && message.from.tag !== state.user!.tag) {
      dispatch({
        type: ActionTypes.UpdateUserInfo,
        payload: {
          tag: message.from.tag
        }
      });
    }

    const linkman = state.linkmans[message.to];
    let title = "";
    if (linkman) {
      dispatch({
        type: ActionTypes.AddLinkmanMessage,
        payload: {
          linkmanId: message.to,
          message
        } as AddLinkmanMessagePayload
      });
      if (linkman.type === "group") {
        title = `${message.from.username} 在 ${linkman.name} 对大家说:`;
      } else {
        title = `${message.from.username} 对你说:`;
      }
    } else {
      // 联系人不存在并且是自己发的消息, 不创建新联系人
      if (isSelfMessage) {
        return;
      }
      const newLinkman = {
        _id: getFriendId(state.user!._id, message.from._id),
        type: "temporary",
        createTime: Date.now(),
        avatar: message.from.avatar,
        name: message.from.username,
        messages: [],
        unread: 1
      };
      dispatch({
        type: ActionTypes.AddLinkman,
        payload: {
          linkman: (newLinkman as unknown) as Linkman,
          focus: false
        }
      });
      title = `${message.from.username} 对你说:`;

      const messages = await getLinkmanHistoryMessages(newLinkman._id, 0);
      if (messages) {
        dispatch({
          type: ActionTypes.AddLinkmanHistoryMessages,
          payload: {
            linkmanId: newLinkman._id,
            messages
          } as AddLinkmanHistoryMessagesPayload
        });
      }
    }

    if (windowStatus === "blur" && state.status.notificationSwitch) {
      notification(
        title,
        message.from.avatar,
        message.type === "text"
          ? message.content.replace(/&lt;/g, "<").replace(/&gt;/g, ">")
          : `[${message.type}]`,
        Math.random().toString()
      );
    }

    if (state.status.soundSwitch) {
      const soundType = state.status.sound;
      playSound(soundType);
    }

    if (state.status.voiceSwitch) {
      if (message.type === "text") {
        const text = message.content
          .replace(
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g,
            ""
          )
          .replace(/#/g, "");

        if (text.length > 100) {
          return;
        }

        const from =
          linkman && linkman.type === "group"
            ? `${message.from.username}${
            linkman.name === prevName ? "" : `在${linkman.name}`
            }说`
            : `${message.from.username}对你说`;
        if (text) {
          voice.push(
            from !== prevFrom ? from + text : text,
            message.from.username
          );
        }
        prevFrom = from;
        prevName = message.from.username;
      } else if (message.type === "system") {
        voice.push(message.from.originUsername + message.content, null);
        prevFrom = null;
      }
    }
  });

  socket.on("changeGroupName", (e: { groupId: string, name: string }) => {
    dispatch({
      type: ActionTypes.SetLinkmanProperty,
      payload: {
        linkmanId: e.groupId,
        key: "name",
        value: e.name
      } as SetLinkmanPropertyPayload
    });
  });

  socket.on("deleteGroup", (e: { groupId: string }) => {
    dispatch({
      type: ActionTypes.RemoveLinkman,
      payload: e.groupId
    });
  });

  socket.on("changeTag", (tag: string) => {
    dispatch({
      type: ActionTypes.UpdateUserInfo,
      payload: {
        tag
      }
    });
  });
  // @ts-ignore
  socket.on("deleteMessage", ({ linkmanId, messageId }) => {
    dispatch({
      type: ActionTypes.DeleteMessage,
      payload: {
        linkmanId,
        messageId
      } as DeleteMessagePayload
    });
  });

  return socket
}

// 考虑使用 query 参数还是 websocket token 事件 
// socketConnect('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb25JZCI6OTQ5MSwiYXVkIjpbImNzLWFkbWluIiwiaW0iLCJib3QiLCJvYXV0aDIiXSwidXNlcl9uYW1lIjoiYWRtaW4iLCJzY29wZSI6WyJ0ZXN0Il0sImV4cCI6MTU4NTAzNTYxNSwiYXV0aG9yaXRpZXMiOlsiUk9MRV9BRE1JTiJdLCJqdGkiOiIzNzE3YjdhZS0wMDExLTRiOWMtYTg0NC04ZDAyNTA1MWE3NWEiLCJjbGllbnRfaWQiOiJ1c2VyX2NsaWVudCJ9.N68MBKuxaitBXmQ_2wd2P3PPASrksTj8ug3BlRbAvlE1F6KjsY3owgW2XbH3y5c3VTyyLEGkuq4TOmqbaf9s5Mk76oRpFg1BPkDaTyXqKxT3eQHDUO-QRz-e2cgSPISaqAQnz_j5iZszLOLXxFmXVIbvNKU1uuW4-HiSPwaVqpJ3yc_DMAJ8gqfPg0wH3MXQK6tscyxHJWsuT35KxML4IPu5JK92YmcLFru-XxRaeHHOTfI_IWL1zvtYK_Dvlwatt4b0MVaY8lC1HZLrlnCoGLiYkJKSMMWm6QXClhX6CZJSiBw1szaP6LcrMinnE3JjUs20nW2CqLxjNdt-m6jhWA')

export default socketConnect;
