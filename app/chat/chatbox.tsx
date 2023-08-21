import React, { useState, useEffect, useRef } from "react";
import { defaultResponse, backEndBase } from "../config";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { XCircleFill, Send } from "react-bootstrap-icons";
import * as Type from "./types";

async function ChatToDDGS(
    query: string,
    setChatHistory: (value: React.SetStateAction<Type.ChatHistory>) => void
) {
    try {
        const response = await fetch(
            backEndBase + "/chat/openai_ddgs",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: query }),
            }
        );
        if(response.status == 401){
            throw 0;
        }
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
                console.log(error)
                if (successIndex != -1) {
                    buffer += resultList.at(successIndex);
                }
                continue;
            }
        }
    } catch (error) {
        let errorMsg = "接口异常，请重试！";
        if(error === 0){
            errorMsg = "鉴权失败，请先登陆！";
        }
        setChatHistory((prevHistory) => {
            const newHistory = [...prevHistory.history];
            newHistory[newHistory.length - 1].isError = errorMsg;
            return { ...prevHistory, history: newHistory };
        });
    }
}

function UserBox({
    index,
    userIdentity,
    content,
}: {
    index: number;
    userIdentity: Type.Identity;
    content: string;
}) {
    return (
        <li
            key={index}
            className="flex flex-col gap-y-1 origin-top animate-popOut"
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
                className="sm:mx-4 lg:mx-8"
                children={content}
            />
        </li>
    );
}

function RobotBox({
    isLoading,
    index,
    robotIdentity,
    chatItem,
    chatHistory,
    handleRobotButtonClick,
    handleRobotButtonClose,
    buttonRef,
    displayState,
}: {
    isLoading: boolean;
    index: number;
    robotIdentity: Type.Identity;
    chatItem: Type.ChatItem;
    chatHistory: Type.ChatHistory;
    handleRobotButtonClick: (
        index: number,
        props: any,
        e: React.MouseEvent<HTMLButtonElement>
    ) => void;
    handleRobotButtonClose: () => void;
    buttonRef: React.RefObject<HTMLButtonElement>;
    displayState: number[];
}) {
    // 显示参考组件
    const RefBoxComponent = () => {
        return (
            !isLoading &&
            displayState.at(0) == index &&
            displayState.at(1) != -1 && (
                <RefBox
                    ref={buttonRef}
                    closeHandler={handleRobotButtonClose}
                    url={chatItem.references?.at(displayState.at(1)!)?.url}
                    title={chatItem.references?.at(displayState.at(1)!)?.title}
                    content={chatItem.references?.at(displayState.at(1)!)?.content}
                ></RefBox>
            )
        );
    };
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
                <div
                    style={{
                        display: chatItem.isError ? "block" : "none"
                    }}
                    className="p-4 mx-8 w-3/4 text-sm text-red-800 rounded-lg bg-red-50"
                    role="alert"
                >
                    <span className="font-bold">错误:</span> {chatItem.isError}
                </div>
                <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    className="sm:mx-2 lg:mx-8"
                    children={chatItem.content}
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
                <RefBoxComponent></RefBoxComponent>

                {Array.from(chatItem.appendix.entries()).map(([key, value]) => {
                    if (key == "reference_urls" && value.length > 0) {
                        return (
                            <div className="m-3 border-t">
                                <div className="mt-3 flex flex-wrap items-center mx-3 text-sm gap-x-2 gap-y-1 origin-left animate-popOut">
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
                })}
            </div>
        </li>
    );
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
    const [displayState, setDisplayState] = useState([-1, -1]);
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
            isError: null,
        });
        setChatHistory(chatHistoryCopy);
    }

    // 引用查看按钮被点击
    const handleRobotButtonClick = (
        index: number,
        props: any,
        e: React.MouseEvent<HTMLButtonElement>
    ) => {
        (!isLoading && displayState.at(0) != index) ||
            displayState.at(1) != props.refid
            ? setDisplayState([props.conversationid, props.refid])
            : setDisplayState([-1, -1]);
    };

    // 引用关闭
    const handleRobotButtonClose = () => {
        setDisplayState([-1, -1]);
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
                    isError: null,
                });
                return { ...prevHistory, history: newHistory };
            });
        }
        await executeAfterDelay();

        // 与接口通信，获取模型输出
        await ChatToDDGS(query, setChatHistory);

        setIsLoading(false);
        inputRef.current!.focus();
    }

    if (chatHistoryCopy.history.length === 0) {
        StaticAddHistory(Type.IdentityType.ROBOT, defaultResponse);
    }
    return (
        <div className="flex flex-col w-full min-w-screen max-w-screen min-h-screen max-h-screen pb-8">
            <div className="h-[88%] mx-4">
                <div
                    className="flex flex-col p-4 rounded-t-2xl bg-gray-100 h-[85%] overflow-y-scroll"
                    ref={chatHistoryRef}
                >
                    <ul role="list" className="flex flex-col gap-y-4">
                        {chatHistory.history.map((chatitem, index) => {
                            if (chatitem.type == Type.IdentityType.USER) {
                                return (
                                    <UserBox
                                        index={index}
                                        userIdentity={userIdentity}
                                        content={chatitem.content}
                                    ></UserBox>
                                );
                            } else {
                                return (
                                    <RobotBox
                                        isLoading={isLoading}
                                        index={index}
                                        robotIdentity={robotIdentity}
                                        chatItem={chatitem}
                                        chatHistory={chatHistory}
                                        handleRobotButtonClick={handleRobotButtonClick}
                                        handleRobotButtonClose={handleRobotButtonClose}
                                        buttonRef={buttonRef}
                                        displayState={displayState}
                                    ></RobotBox>
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
