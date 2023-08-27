import {
    Plus,
    Github
} from "react-bootstrap-icons";
import { footer, github } from "../config";
import React, { useState, useEffect } from "react";

export default function Siderbar({
    isOpen,
}: {
    isOpen: boolean;
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


    return (
        <div className="min-h-screen">
            <div
                className={`${sidebarStyle} ${hiddenStyle} transform top-0 left-0 whitespace-nowrap h-5/6`}
                style={{ transition: "transform 0.1s, width 0.1s ease-in-out" }}
            >
                <div className="flex flex-col px-8 h-full gap-y-2">
                    <button className="inline-flex items-center w-full h-8 rounded-full bg-gray-100 hover:bg-gray-300 text-sm">
                        <Plus className="w-5 h-5 ml-5 mr-8" />
                        新应用
                    </button>
                    <button className="inline-flex items-center w-full h-8 rounded-full bg-gray-100 hover:bg-gray-300 text-sm">
                        <Plus className="w-5 h-5 ml-5 mr-8" />
                        构建知识库
                    </button>
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
