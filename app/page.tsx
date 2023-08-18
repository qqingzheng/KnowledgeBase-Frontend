"use client";

import React, { useState, useEffect, useRef } from "react";
import { title, footer, github, defaultResponse } from "./config";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import {
  XCircleFill,
  LayoutSidebarInset,
  EnvelopeFill,
} from "react-bootstrap-icons";

enum IdentityType {
  USER,
  ROBOT,
}
interface Identity {
  identity: string;
  avatarUrl: string;
  nickName: string;
  type: IdentityType;
}
interface ChatItem {
  type: IdentityType;
  content: string;
  appendix: Map<string, Array<any>>;
  references: Array<any>;
}
interface ChatHistory {
  history: Array<ChatItem>;
}

interface Conversation {
  id: Number;
  displayName: string;
  selected: boolean;
  date: Date;
}

function RefBox({
  ref,
  closeHandler,
  url,
  title,
  content,
}: {
  ref: React.MutableRefObject<HTMLButtonElement | null>;
  closeHandler: () => void;
  url: string;
  title: string;
  content: string;
}) {
  return (
    <div className="flex flex-row justify-center">
      <div className="flex flex-col z-50 relative mt-2 w-3/4 p-4 origin-top rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 animate-popOut">
        <div className="inline-flex flex-row justify-between">
          <a href={url} target="_blank" className="text-xl">
            {title}
          </a>
          <button
            ref={ref}
            onClick={closeHandler}
            className="text-lg text-red-400 hover:text-red-500"
          >
            <XCircleFill />
          </button>
        </div>
        <div className="border-b mt-2"></div>
        <span className="mt-2 text-sm">...{content}...</span>
      </div>
    </div>
  );
}

function Chat({
  userIdentity,
  robotIdentity,
  defaultChatHistory,
}: {
  userIdentity: Identity;
  robotIdentity: Identity;
  defaultChatHistory: ChatHistory;
}) {
  const [inputValue, setInputValue] = useState("");
  const [displayRef, setDisplayRef] = useState([-1, -1]);
  const [chatHistory, setChatHistory] = useState(defaultChatHistory);
  const [isLoading, setIsLoading] = useState(false);
  const chatHistoryCopy = chatHistory;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  function StaticAddHistory(type: IdentityType, content: string) {
    chatHistoryCopy.history.push({
      type: type,
      content: content,
      appendix: new Map(),
      references: new Array(),
    });
    setChatHistory(chatHistoryCopy);
  }
  const handleRobotButtonClick = (
    index: number,
    props: any,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    (!isLoading && displayRef.at(0) != index) || displayRef.at(1) != props.refid
      ? setDisplayRef([props.conversationid, props.refid])
      : setDisplayRef([-1, -1]);
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    let positionedParent = (e.target as HTMLElement).parentElement;
    while (
      positionedParent &&
      getComputedStyle(positionedParent).position === "static"
    ) {
      positionedParent = positionedParent.parentElement;
    }
    const parentRect = positionedParent?.getBoundingClientRect();
    const relativeX = mouseX - parentRect!.left;
    const relativeY = mouseY - parentRect!.top;
    setCoords({ x: relativeX, y: relativeY });
    console.log(coords);
  };
  const handleRobotButtonClose = () => {
    setDisplayRef([-1, -1]);
  };
  useEffect(() => {
    if (isLoading && chatHistoryRef.current) {
      const scrollContainer = chatHistoryRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [isLoading, chatHistory]);
  async function sendMessage() {
    if (!inputValue.trim()) {
      return; // Do not send an empty message
    }
    setIsLoading(true);
    let query = inputValue;
    setInputValue("");
    StaticAddHistory(IdentityType.USER, query);
    function delay(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async function executeAfterDelay() {
      await delay(100);
      setChatHistory((prevHistory) => {
        const newHistory = [...prevHistory.history];
        newHistory.push({
          type: IdentityType.ROBOT,
          content: "",
          appendix: new Map(),
          references: new Array(),
        });
        return { ...prevHistory, history: newHistory };
      });
    }
    await executeAfterDelay();

    try {
      const response = await fetch(
        "http://36.133.182.227:10005/chat/openai_ddgs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: query, top_k: 8 }),
        }
      );
      const reader = response.body!.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        let resultList = new TextDecoder().decode(value).trim().split("\n");
        resultList.map((result, index) => {
          let jsonResult = JSON.parse(result);
          if ("metas" in jsonResult) {
            setChatHistory((prevHistory) => {
              const newHistory = [...prevHistory.history];
              newHistory[newHistory.length - 1].content += jsonResult.response;
              newHistory[newHistory.length - 1].appendix = new Map([
                ["reference_urls", jsonResult.metas],
              ]);
              newHistory[newHistory.length - 1].references =
                jsonResult.references;
              return { ...prevHistory, history: newHistory };
            });
          } else {
            setChatHistory((prevHistory) => {
              const newHistory = [...prevHistory.history];
              newHistory[newHistory.length - 1].content += jsonResult.response;
              newHistory[newHistory.length - 1].content = newHistory[
                newHistory.length - 1
              ].content.replace(/\[(\d+)\]/g, (match, number) => {
                return `<button conversationid=${
                  newHistory.length - 1
                } refid=${number}></button>`;
              });
              newHistory[newHistory.length - 1].content = newHistory[
                newHistory.length - 1
              ].content.replace(/\[index (\d+)\]/g, (match, number) => {
                return `<button conversationid=${
                  newHistory.length - 1
                } refid=${number}></button>`;
              });
              newHistory[newHistory.length - 1].content.replace("", "");
              return { ...prevHistory, history: newHistory };
            });
          }
        });
      }
    } catch (error) {
      console.error("There was an error sending the message:", error);
    }
    setIsLoading(false);
    inputRef.current!.focus();
  }

  if (chatHistoryCopy.history.length === 0) {
    StaticAddHistory(IdentityType.ROBOT, defaultResponse);
  }
  return (
    <div className="flex flex-col w-full min-w-screen max-w-screen min-h-screen max-h-screen">
      <div className="h-[85%] mx-6">
        <div
          className="flex flex-col p-4 rounded-t-2xl bg-gray-100 h-[85%] overflow-y-scroll"
          ref={chatHistoryRef}
        >
          <ul role="list" className="flex flex-col gap-y-3">
            {chatHistory.history.map((chatitem, index) => {
              if (chatitem.type == IdentityType.USER) {
                return (
                  <li
                    key={index}
                    className="flex flex-col gap-y-1 p-2 origin-top animate-popOut"
                  >
                    <div className="flex items-center gap-x-2">
                      <img
                        className="h-10 w-10 flex-none rounded-full bg-gray-50"
                        src={userIdentity.avatarUrl}
                        alt=""
                      />
                      <div className="min-w-0 flex-auto">
                        <p className="text-normal font-semibold leading-6 text-gray-900">
                          {userIdentity.nickName}
                        </p>
                      </div>
                    </div>
                    <ReactMarkdown
                      rehypePlugins={[rehypeRaw]}
                      className="mx-8"
                      children={chatitem.content}
                    />
                  </li>
                );
              } else {
                return (
                  <li
                    key={index}
                    className="flex flex-col gap-y-1 bg-white rounded-lg origin-top animate-popOut"
                  >
                    <div
                      style={{
                        display:
                          isLoading && index === chatHistory.history.length - 1
                            ? "block"
                            : "none",
                      }}
                      className="relative bg-blue-200 h-1 rounded-full w-full bg-gradient-to-r animate-pulse from-blue-400 via-pink-600 to-blue-700 repeat-x"
                    ></div>
                    <div className="p-5 flex flex-col gap-y-1">
                      <div className="flex items-center gap-x-2">
                        <img
                          className="h-10 w-10 flex-none rounded-full bg-gray-50"
                          src={robotIdentity.avatarUrl}
                          alt=""
                        />
                        <div className="min-w-0 flex-auto">
                          <p className="text-normal font-semibold leading-6 text-gray-900">
                            {robotIdentity.nickName}
                          </p>
                        </div>
                      </div>
                      <ReactMarkdown
                        rehypePlugins={[rehypeRaw]}
                        className="mx-8"
                        children={chatitem.content}
                        components={{
                          button: ({ node, ...props }) => (
                            <div className="inline-flex relative">
                              <button
                                onClick={(e) => {
                                  handleRobotButtonClick(index, props, e);
                                }}
                                className="text-blue-700"
                              >
                                [{(props as any).refid}]
                              </button>
                            </div>
                          ),
                        }}
                      />
                      {!isLoading &&
                        displayRef.at(0) == index &&
                        displayRef.at(1) != -1 && (
                          <RefBox
                            ref={buttonRef}
                            closeHandler={handleRobotButtonClose}
                            url={
                              chatitem.references?.at(displayRef.at(1)!)?.url
                            }
                            title={
                              chatitem.references?.at(displayRef.at(1)!)?.title
                            }
                            content={
                              chatitem.references?.at(displayRef.at(1)!)
                                ?.content
                            }
                          ></RefBox>
                        )}
                      {Array.from(chatitem.appendix.entries()).map(
                        ([key, value]) => {
                          if (key == "reference_urls" && value.length > 0) {
                            return (
                              <div className="m-3 border-t">
                                <div className="mt-3 flex flex-wrap items-center mx-10 text-sm gap-x-2 gap-y-1 origin-left animate-popOut">
                                  参考网址：
                                  {value.map((refItem, refIndex) => {
                                    return (
                                      <a
                                        key={refIndex}
                                        href={refItem.source}
                                        target="_blank"
                                        className="inline-block w-24 h-5 truncate bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded whitespace-nowrap"
                                      >
                                        {refItem.title}
                                      </a>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          } else {
                            return <div id="refs"></div>;
                          }
                        }
                      )}
                    </div>
                  </li>
                );
              }
            })}
          </ul>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="relative flex flex-row gap-x-5 p-5 items-center rounded-b-2xl bg-gray-100 h-[15%] w-full">
            <input
              ref={inputRef}
              className="rounded-full px-5 py-2 w-11/12"
              placeholder="输入你的问题..."
              value={inputValue}
              disabled={isLoading}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              type="submit"
              disabled={isLoading}
              onClick={sendMessage}
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 inline-flex justify-center items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Siderbar({
  isOpen,
  conversations,
}: {
  isOpen: boolean;
  conversations: Array<Conversation>;
}) {
  const [showPopup, setShowPopup] = useState(-1);
  const sidebarStyle = isOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full";
  const hiddenStyle = isOpen && showPopup != -1 ? "" : "overflow-hidden";
  useEffect(() => {
    if (!isOpen) {
      setShowPopup(-1);
    }
  }, [isOpen]);
  return (
    <div className="min-h-screen">
      <div
        className={`${sidebarStyle} ${hiddenStyle} transform top-0 left-0 whitespace-nowrap h-5/6`}
        style={{ transition: "transform 0.3s, width 0.3s ease-in-out" }}
      >
        <div className="flex flex-col px-8 h-full">
          <button className="inline-flex justify-center items-center w-full h-8 rounded-full bg-gray-100 hover:bg-gray-300 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              className="mr-4"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
            </svg>
            新的对话
          </button>
          <span className="text-xs mt-5 font-semibold">近期对话</span>
          <div className="mt-2"></div>
          <div className="flex flex-col">
            {conversations.map((conversation, index) => {
              let selectedFontFormat: string = "";
              let selectedButtonFormat: string =
                "bg-gray-100 hover:bg-gray-200";
              let selectedDotsFormat: string = "bg-gray-100 hover:bg-white";
              if (conversation.selected) {
                selectedFontFormat = "";
                selectedButtonFormat = "bg-blue-300 hover:bg-blue-400";
                selectedDotsFormat = "bg-blue-300 hover:bg-gray-100";
              }
              return (
                <div key={index} className="mt-2 flex flex-row">
                  <button
                    className={`inline-flex justify-between items-center w-full h-10 rounded-full ${selectedButtonFormat}`}
                  >
                    <EnvelopeFill className="mx-3"></EnvelopeFill>
                    <span
                      className={`text-sm truncate w-24 ${selectedFontFormat}`}
                    >
                      {conversation.displayName}
                    </span>

                    <div
                      role="button"
                      id="menu-button"
                      aria-expanded="true"
                      aria-haspopup="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPopup(showPopup == index ? -1 : index);
                      }}
                      className={`inline-flex justify-center items-center w-6 h-6 mx-2 rounded-full ${selectedDotsFormat}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                      </svg>
                    </div>
                  </button>
                  {showPopup == index && (
                    <div className="flex flex-col absolute -right-[35px] mt-2 origin-left rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 animate-popOut">
                      <button className="rounded-t-lg inline-flex flex-row items-center justify-center gap-x-2 hover:bg-gray-100 text-gray-700 block px-4 py-2 text-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                        </svg>
                        收藏
                      </button>
                      <button className="hover:bg-gray-100 inline-flex flex-row items-center justify-center gap-x-2 text-gray-700 block px-4 py-2 text-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z" />
                        </svg>
                        分享
                      </button>
                      <button className="rounded-b-lg inline-flex flex-row items-center justify-center gap-x-2 hover:bg-red-600 bg-red-500 text-white block px-4 py-2 text-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                          <path
                            fill-rule="evenodd"
                            d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                          />
                        </svg>
                        删除
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <span className="mt-auto inline-flex justify-center">
            <a
              href={github}
              className="text-gray-700 inline-flex justify-center items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="mx-3"
                viewBox="0 0 16 16"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
              </svg>
              {footer}
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

function NavRightFunc() {
  return (
    <img
      className="m-1 ring-1 hover:ring-2 ring-blue-200/50 h-10 w-10 rounded-full bg-gray-50"
      src="https://avatars.githubusercontent.com/u/88202804?v=4"
      alt=""
    />
  );
}

function Nav({ toggleSidebar }: { toggleSidebar: any }) {
  return (
    <div className="flex flex-row items-center justify-between p-4">
      <div className="flex flex-row items-center">
        <button
          onClick={toggleSidebar}
          className="inline-flex justify-center items-center w-10 h-10 mr-2 rounded-full bg-gray-50 hover:bg-gray-200 hover:text-white text-gray-500"
        >
          <LayoutSidebarInset />
        </button>
        <span>{title}</span>
        <span className="ml-1 inline-flex items-center rounded-md bg-red-50 px-1 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
          Demo
        </span>
      </div>
      <div className="flex flex-row mr-2 truncate">
        <NavRightFunc />
      </div>
    </div>
  );
}

function Content({
  isOpen,
  conversations,
  userIdentity,
  robotIdentity,
  chatHistory,
}: {
  isOpen: boolean;
  conversations: Array<Conversation>;
  userIdentity: Identity;
  robotIdentity: Identity;
  chatHistory: ChatHistory;
}) {
  return (
    <div className="flex flex-row">
      <Siderbar isOpen={isOpen} conversations={conversations} />
      <Chat
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
  let conversations: Array<Conversation>;
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

  let userIdentity: Identity = {
    identity: "chestnut",
    nickName: "Chestnut",
    avatarUrl: "https://avatars.githubusercontent.com/u/88202804?v=4",
    type: IdentityType.USER,
  };
  let robotIdentity: Identity = {
    identity: "robot",
    nickName: "Robot",
    avatarUrl: "https://avatars.githubusercontent.com/u/105474769?s=200&v=4",
    type: IdentityType.ROBOT,
  };
  let chatHistory: ChatHistory = {
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
