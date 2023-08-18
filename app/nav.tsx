import { LayoutSidebarInset } from "react-bootstrap-icons";
import { title } from "./config";

function NavLeftFunc({ toggleSidebar }: { toggleSidebar: any }) {
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
    <div className="flex flex-row items-center">
      {toggleButton}
      {titleComponent}
      {stateComponent}
    </div>
  );
}

function NavRightFunc({ avatarSrcInput }: { avatarSrcInput: string }) {
  // 显示的头像
  const AvatarComponent = ({ avatarSrc }: { avatarSrc: string }) => {
    return (
      <img
        className="m-1 ring-1 hover:ring-2 ring-blue-200/50 h-10 w-10 rounded-full bg-gray-50"
        src={avatarSrc}
        alt=""
      />
    );
  };
  return (
    <div className="flex flex-row mr-2 truncate">
      <AvatarComponent avatarSrc={avatarSrcInput}></AvatarComponent>
    </div>
  );
}

export default function Nav({ toggleSidebar }: { toggleSidebar: any }) {
  return (
    <div className="flex flex-row items-center justify-between p-4">
      <NavLeftFunc toggleSidebar={toggleSidebar} />
      <NavRightFunc avatarSrcInput="https://avatars.githubusercontent.com/u/88202804?v=4" />
    </div>
  );
}
