import {
    EnvelopeFill,
    ThreeDotsVertical,
    StarFill,
    ShareFill,
    Trash,
    Plus,
    Github
} from "react-bootstrap-icons";
import { footer, github } from "../config";
import React, { useState, useEffect } from "react";
import * as Type from "../types"

export default function Siderbar({
    isOpen,
    conversations,
}: {
    isOpen: boolean;
    conversations: Array<Type.Conversation>;
}) {
    // 对话操作框是否弹出
    const [showPopup, setShowPopup] = useState(-1);

    // 当siderbar发生变化时，对话操作框要关闭
    useEffect(() => {
        if (!isOpen) {
            setShowPopup(-1);
        }
    }, [isOpen]);

    // 当点击非操作框区域时，对话操作框要关闭
    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (showPopup !== -1) {
                const isTrigger = event.target.closest(".popup-trigger");
                const isPopup = event.target.closest(".popup-content");
                if (!isTrigger && !isPopup) {
                    setShowPopup(-1);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showPopup]);

    // 侧边栏动画
    const sidebarStyle = isOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full";
    const hiddenStyle = isOpen && showPopup != -1 ? "" : "overflow-hidden";


    // 组件
    const newConvComponents = (
        <button className="inline-flex justify-center items-center w-full h-8 rounded-full bg-gray-100 hover:bg-gray-300 text-sm">
                <Plus className="w-4 h-4 mr-5" />
                新的对话
        </button>
    )

    return (
        <div className="min-h-screen">
            <div
                className={`${sidebarStyle} ${hiddenStyle} transform top-0 left-0 whitespace-nowrap h-5/6`}
                style={{ transition: "transform 0.1s, width 0.1s ease-in-out" }}
            >
                <div className="flex flex-col px-8 h-full">
                    { newConvComponents }
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
                                            className={`popup-trigger inline-flex justify-center items-center w-6 h-6 mx-2 rounded-full ${selectedDotsFormat}`}
                                        >
                                            <ThreeDotsVertical />
                                        </div>
                                    </button>
                                    {showPopup == index && (
                                        <div className="popup-content flex flex-col absolute -right-[35px] mt-2 origin-left rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 animate-popOut">
                                            <button className="rounded-t-lg inline-flex flex-row items-center justify-center gap-x-2 hover:bg-gray-100 text-gray-700 block px-4 py-2 text-sm">
                                                <StarFill />
                                                收藏
                                            </button>
                                            <button className="hover:bg-gray-100 inline-flex flex-row items-center justify-center gap-x-2 text-gray-700 block px-4 py-2 text-sm">
                                                <ShareFill />
                                                分享
                                            </button>
                                            <button className="rounded-b-lg inline-flex flex-row items-center justify-center gap-x-2 hover:bg-red-600 bg-red-500 text-white block px-4 py-2 text-sm">
                                                <Trash />
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
                            <Github className="mx-3" />
                            {footer}
                        </a>
                    </span>
                </div>
            </div>
        </div>
    );
}
