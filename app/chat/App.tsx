import React, { useMemo, useState, useEffect, useRef } from "react";
import { hot } from "react-hot-loader";
import { useSelector } from "react-redux";

import "./assets/styles/normalize.less";
import "./assets/styles/iconfont.less";

import Style from "./App.less";
import { isMobile } from "../utils/ua";
import { State } from "./state/reducer";

import LoginAndRegister from "./modules/LoginAndRegister/LoginAndRegister";
import Sidebar from "./modules/Sidebar/Sidebar";
import FunctionBarAndLinkmanList from "./modules/FunctionBarAndLinkmanList/FunctionBarAndLinkmanList";
import UserInfo from "./modules/UserInfo";
import GroupInfo from "./modules/GroupInfo";
import { ShowUserOrGroupInfoContext } from "./context";
import Chat from "./modules/Chat/Chat";
import inobounce from "../utils/inobounce";

/**
 * 获取窗口宽度百分比
 */
// eslint-disable-next-line
function getWidthPercent() {
  let width = 0.6;
  if (isMobile) {
    width = 1;
  } else if (window.innerWidth < 1000) {
    width = 0.9;
  } else if (window.innerWidth < 1300) {
    width = 0.8;
  } else if (window.innerWidth < 1600) {
    width = 0.7;
  } else {
    width = 0.6;
  }
  return width;
}

function getWidthPercent_v2(){
  let width = 0.96
  return width
}

function getHeightPercent_v2(){
  let height = 0.85
  return height
}

/**
 * 获取窗口高度百分比
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getHeightPercent() {
  let height = 0.8;
  if (isMobile) {
    height = 1;
  } else if (window.innerHeight < 1000) {
    height = 0.9;
  } else {
    height = 0.8;
  }
  return height;
}

function App() {
  const backgroundImage = useSelector(
    (state: State) => state.status.backgroundImage
  );
  const $app = useRef<any>(null);

  // 计算窗口高度/宽度百分比
  const [width, setWidth] = useState(getWidthPercent_v2());
  const [height, setHeight] = useState(getHeightPercent_v2());
  useEffect(() => {
    window.onresize = () => {
      setWidth(getWidthPercent_v2());
      setHeight(getHeightPercent_v2());
    };

    inobounce($app.current);
  }, []);

  // 获取底图尺寸
  const [backgroundWidth, setBackgroundWidth] = useState(window.innerWidth);
  const [backgroundHeight, setBackgroundHeight] = useState(window.innerHeight);
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setBackgroundWidth(Math.max(img.width, window.innerWidth));
      setBackgroundHeight(Math.max(img.height, window.innerHeight));
    };
    img.src = backgroundImage;
  }, [backgroundImage]);

  // 主体样式
  const style = useMemo(
    () => ({
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: `${backgroundWidth}px ${backgroundHeight}px`,
      backgroundRepeat: "no-repeat"
    }),
    [backgroundImage, backgroundWidth, backgroundHeight]
  );

  // 聊天窗口样式
  const childStyle = useMemo(
    () => ({
      width: `${width * 100}%`,
      height: `${height * 100}%`,
      // left: `${((1 - width) / 2) * 100}%`,
      left: `2%`,
      // top: `${((1 - height) / 2) * 100}%`
      top: `11%`
    }),
    [width, height]
  );

  // 模糊背景样式
  const blurStyle = useMemo(
    () => ({
      backgroundPosition: `${(-(1 - width) * window.innerWidth) / 2}px ${(-(
        1 - height
      ) *
        window.innerHeight) /
        2}px`,
      ...style,
      ...childStyle
    }),
    [width, height, style, childStyle]
  );

  const [userInfoDialog, toggleUserInfoDialog] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  const [groupInfoDialog, toggleGroupInfoDialog] = useState<boolean>(false);
  const [groupInfo, setGroupInfo] = useState<any>(null);

  const contextValue = useMemo(
    () => ({
      showUserInfo(user: React.SetStateAction<any>) {
        setUserInfo(user);
        toggleUserInfoDialog(true);
      },
      showGroupInfo(group: React.SetStateAction<any>) {
        setGroupInfo(group);
        toggleGroupInfoDialog(true);
      }
    }),
    []
  );

  return (
    <div className={Style.app} style={style} ref={$app}>
      <div className={Style.blur} style={blurStyle} />
      <div className={Style.child} style={childStyle}>
        <ShowUserOrGroupInfoContext.Provider value={contextValue as any}>
          <Sidebar />
          <FunctionBarAndLinkmanList />
          <Chat />
        </ShowUserOrGroupInfoContext.Provider>
      </div>
      <LoginAndRegister />
      <UserInfo
        visible={userInfoDialog}
        onClose={() => toggleUserInfoDialog(false)}
        user={userInfo}
      />
      <GroupInfo
        visible={groupInfoDialog}
        onClose={() => toggleGroupInfoDialog(false)}
        group={groupInfo}
      />
    </div>
  );
}

export default hot(module)(App);
