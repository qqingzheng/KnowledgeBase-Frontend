"use client";

import React, { useState, useEffect, useRef } from "react";
import Nav from "./nav";
import Siderbar from "./siderbar";
import ChatBox from "./chatbox";
import * as Type from "./types";

function Content({
  isOpen,
  conversations,
  userIdentity,
  robotIdentity,
  chatHistory,
}: {
  isOpen: boolean;
  conversations: Array<Type.Conversation>;
  userIdentity:Type.Identity;
  robotIdentity:Type.Identity;
  chatHistory: Type.ChatHistory;
}) {
  return (
    <div className="flex flex-row">
      <Siderbar isOpen={isOpen} conversations={conversations} />
      <ChatBox
        userIdentity={userIdentity}
        robotIdentity={robotIdentity}
        defaultChatHistory={chatHistory}
      />
    </div>
  );
}

export default function Main() {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
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
  conversations.push({
    id: 0,
    displayName: "你好，请问什么是承租人优先权",
    selected: true,
    date: new Date(),
  });
  conversations.push({
    id: 0,
    displayName: "请问你叫什么名字",
    selected: false,
    date: new Date(),
  });

  let userIdentity:Type.Identity = {
    identity: "chestnut",
    nickName: "Chestnut",
    avatarUrl: "https://avatars.githubusercontent.com/u/88202804?v=4",
    type: Type.IdentityType.USER,
  };
  let robotIdentity:Type.Identity = {
    identity: "robot",
    nickName: "Robot",
    avatarUrl: "https://avatars.githubusercontent.com/u/105474769?s=200&v=4",
    type: Type.IdentityType.ROBOT,
  };
  let chatHistory:Type.ChatHistory = {
    history: new Array(),
  };
  return (
    <main className="fixed flex flex-col bg-white min-w-full">
      <Nav toggleSidebar={toggleSidebar} />
      <Content
        isOpen={isOpen}
        conversations={conversations}
        userIdentity={userIdentity}
        robotIdentity={robotIdentity}
        chatHistory={chatHistory}
      />
    </main>
  );
}
