"use client";

import { checkIfLogin, getAppInfo, getUserInfo } from "../security/auth";
import React, { useState, useEffect, useRef } from "react";
import Nav from "../nav";
import Siderbar from "./siderbar";
import ChatBox from "./chatbox";
import * as Type from "../types";

function Content({
  isOpen,
  conversations,
  userInfo,
  appInfo,
  chatHistory,
  isAppInfoLoaded,
}: {
  isOpen: boolean;
  conversations: Array<Type.Conversation>;
  userInfo: any,
  appInfo: any,
  chatHistory: Type.ChatHistory;
  isAppInfoLoaded: boolean
}) {
  return (
    <div className="flex flex-row">
      <Siderbar isOpen={isOpen} conversations={conversations} />
      <ChatBox
        isAppInfoLoaded={isAppInfoLoaded}
        userInfo={userInfo}
        appInfo={appInfo}
        defaultChatHistory={chatHistory}
      />
    </div>
  );
}

export default function Main() {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({username: "", avatar_url: ""});
  const [appInfo, setAppInfo] = useState({username: "", cover_img: ""});
  const [isAppInfoLoaded, setIsAppInfoLoaded] = useState(false); 
  async function getInfo(appId: string) {
    let identity = await getUserInfo();
    setUserInfo(identity.data);
    let appInfo = await getAppInfo(appId);
    if(appInfo == null){
      window.location.href = "/hub";
    }
    appInfo.data['app_id'] = appId;
    setAppInfo(appInfo.data);
    setIsAppInfoLoaded(true);
  }
  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const appId = urlParams.get('app');
    if(appId == null){
      window.location.href = "/hub";
    }else{
      checkIfLogin();
      getInfo(appId);
    }
    
  }, []);

  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  let conversations: Array<Type.Conversation>;
  conversations = new Array();
  let chatHistory:Type.ChatHistory = {
    history: new Array(),
  };
  return (
    <main className="fixed flex flex-col bg-white min-w-full">
      <Nav userInfo={userInfo} toggleSidebar={toggleSidebar} />
      <Content
        isAppInfoLoaded={isAppInfoLoaded}
        isOpen={isOpen}
        conversations={conversations}
        userInfo={userInfo}
        appInfo={appInfo}
        chatHistory={chatHistory}
      />
    </main>
  );
}
