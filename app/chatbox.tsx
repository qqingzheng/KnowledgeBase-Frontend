import React, { useState, useEffect, useRef } from "react";
import { defaultResponse } from "./config";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { XCircleFill, Send } from "react-bootstrap-icons";
import * as Type from "./types";

async function ChatToDDGS(query: string, setChatHistory: (value: React.SetStateAction<Type.ChatHistory>) => void) {
    try {
        const response = await fetch(
            "http://36.133.182.227:10005/chat/openai_ddgs",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: query }),
            }
        );
        const reader = response.body!.getReader();
        let buffer: string = "";
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            buffer += new TextDecoder().decode(value).trim();
            let resultList = buffer.split("\n");
            buffer = "";
            let successIndex: number = -1;
            try {
                resultList.map((result, index) => {
                    successIndex = index;
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
                                return `<button conversationid=${newHistory.length - 1
                                    } refid=${number}></button>`;
                            });
                            newHistory[newHistory.length - 1].content = newHistory[
                                newHistory.length - 1
                            ].content.replace(/\[index (\d+)\]/g, (match, number) => {
                                return `<button conversationid=${newHistory.length - 1
                                    } refid=${number}></button>`;
                            });
                            newHistory[newHistory.length - 1].content = newHistory[
                                newHistory.length - 1
                            ].content.replace("\n", "\n\n");
                            newHistory[newHistory.length - 1].content.replace("", "");
                            return { ...prevHistory, history: newHistory };
                        });
                    }
                });
            } catch (error) {
                if (successIndex != -1) {
                    buffer += resultList.at(successIndex);
                }
                continue;
            }
        }
    } catch (error) {
        console.error("There was an error sending the message:", error);
    }
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
        <div className="flex justify-center m-2">
            <div className="w-11/12 flex flex-col z-50 p-4 origin-top rounded-lg bg-white ring-1 ring-black ring-opacity-5 animate-popOut">
                <div className="flex flex-row justify-between flex flex-wrap">
                    <a
                        href={url}
                        target="_blank"
                        className="flex inline-block w-11/12 text-xl"
                    >
                        {title}
                    </a>
                    <button
                        ref={ref}
                        onClick={closeHandler}
                        className="absolute top-[10px] right-[10px] text-lg text-red-400 hover:text-red-500"
                    >
                        <XCircleFill className="w-[15px] h-[15px]" />
                    </button>
                </div>
                <div className="border-b mt-2"></div>
                <span className="mt-2 w-full text-sm">...{content}...</span>
            </div>
        </div>
    );
}

export default function Chat({
    userIdentity,
    robotIdentity,
    defaultChatHistory,
}: {
    userIdentity: Type.Identity;
    robotIdentity: Type.Identity;
    defaultChatHistory: Type.ChatHistory;
}) {
    // 输入框
    const [inputValue, setInputValue] = useState("");
    // 显示引用内容
    const [displayRef, setDisplayRef] = useState([-1, -1]);
    // 聊天历史
    const [chatHistory, setChatHistory] = useState(defaultChatHistory);
    // GPT是否正在回答
    const [isLoading, setIsLoading] = useState(false);

    const chatHistoryCopy = chatHistory;
    const buttonRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const chatHistoryRef = useRef<HTMLDivElement>(null);

    // 静态添加聊天历史（不会强制刷新页面）
    function StaticAddHistory(type: Type.IdentityType, content: string) {
        chatHistoryCopy.history.push({
            type: type,
            content: content,
            appendix: new Map(),
            references: new Array(),
        });
        setChatHistory(chatHistoryCopy);
    }

    // 引用查看按钮被点击
    const handleRobotButtonClick = (
        index: number,
        props: any,
        e: React.MouseEvent<HTMLButtonElement>
    ) => {
        (!isLoading && displayRef.at(0) != index) || displayRef.at(1) != props.refid
            ? setDisplayRef([props.conversationid, props.refid])
            : setDisplayRef([-1, -1]);
    };

    // 引用关闭
    const handleRobotButtonClose = () => {
        setDisplayRef([-1, -1]);
    };

    // 当聊天时，保持在页面最下方（TO O）
    useEffect(() => {
        if (isLoading && chatHistoryRef.current) {
            const scrollContainer = chatHistoryRef.current;
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }, [isLoading, chatHistory]);

    async function sendMessage() {
        // 确保输入框中有内容
        if (!inputValue.trim()) {
            return;
        }

        setIsLoading(true);
        let query = inputValue;
        setInputValue("");

        // 添加用户提问到聊天历史
        StaticAddHistory(Type.IdentityType.USER, query);

        // 延迟添加机器人回答
        function delay(ms: number): Promise<void> {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }
        async function executeAfterDelay() {
            await delay(100);
            setChatHistory((prevHistory) => {
                const newHistory = [...prevHistory.history];
                newHistory.push({
                    type: Type.IdentityType.ROBOT,
                    content: "",
                    appendix: new Map(),
                    references: new Array(),
                });
                return { ...prevHistory, history: newHistory };
            });
        }
        await executeAfterDelay();

        // 与接口通信
        ChatToDDGS(query, setChatHistory);
        
        setIsLoading(false);
        inputRef.current!.focus();
    }

    if (chatHistoryCopy.history.length === 0) {
        StaticAddHistory(Type.IdentityType.ROBOT, defaultResponse);
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
                            if (chatitem.type == Type.IdentityType.USER) {
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
                            <Send />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
