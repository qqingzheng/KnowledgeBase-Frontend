import { LayoutSidebarInset } from "react-bootstrap-icons";
import { title } from "./config";
import { Identity, IdentityType } from "./types"
import React, { useState, useEffect, useRef } from "react";


export default function Nav({ toggleSidebar, userInfo }: { toggleSidebar: any, userInfo: any }) {
  const [showPopup, setShowPopup] = useState(false);

  // 当点击非操作框区域时，对话操作框要关闭
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (showPopup !== false) {
        const isTrigger = event.target.closest(".setting-popup-trigger");
        const isPopup = event.target.closest(".setting-popup-content");
        if (!isTrigger && !isPopup) {
          setShowPopup(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);


  const AvatarComponent = ({ avatarSrc }: { avatarSrc: string }) => {
    return (
      <img
        className="m-1 ring-1 hover:ring-2 ring-blue-200/50 h-10 w-10 rounded-full bg-gray-50"
        src={avatarSrc}
        alt=""
      />
    );
  };
  // siderbar打开的按钮
  const toggleButton = (
    <button
      onClick={toggleSidebar}
      className="inline-flex justify-center items-center w-10 h-10 mr-2 rounded-full bg-gray-50 hover:bg-gray-200 hover:text-white text-gray-500"
    >
      <LayoutSidebarInset />
    </button>
  );
  // 标题LOGO
  const titleComponent = <span>{title}</span>;
  // 状态
  const stateComponent = (
    <span className="ml-1 inline-flex items-center rounded-md bg-red-50 px-1 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
      Demo
    </span>
  );
  return (
    <div className="flex flex-row items-center justify-between p-4">
      <div className="flex flex-row items-center">
        {toggleButton}
        {titleComponent}
        {stateComponent}
      </div>
      <div className="flex flex-row mr-2 truncate setting-popup-trigger" role="button" onClick={(e) => {
                                                e.stopPropagation();
                                                setShowPopup(showPopup == true ? false : true);
                                            }}>
        <AvatarComponent avatarSrc={userInfo?.avatar_url}></AvatarComponent>
      </div>
      {showPopup && (
        <div className="setting-popup-content flex flex-col absolute right-8 top-16 mt-2 origin-top rounded-lg bg-white ring-1 ring-black ring-opacity-5 animate-popOut z-50">
          <button className="rounded-t-lg inline-flex flex-row items-center justify-center gap-x-2 hover:bg-gray-100 text-gray-700 block px-4 py-2 text-sm">
            设置
          </button>
          <button className="rounded-b-lg inline-flex flex-row items-center justify-center gap-x-2 hover:bg-red-600 bg-red-500 text-white block px-4 py-2 text-sm" onClick={()=>{
            localStorage.removeItem("access_token");
            window.location.href = "/";
          }}>
            登出 Logout
          </button>
        </div>
      )}
    </div>
  );
}
