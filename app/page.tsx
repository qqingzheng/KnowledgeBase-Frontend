import { Github } from "react-bootstrap-icons";
import { title, github, footer } from "./config";

export default function index() {
  return (
    <div className="items-center justify-center bg-white flex w-screen h-screen">
      <div className="flex flex-row ring-1 ring-slate-200 shadow-xl rounded-xl w-[80%] md:w-[60%] h-[70%] overflow-hidden">
        <div className="flex flex-col items-center w-full md:w-1/2 h-full">
          <div className="mt-24">
            <span className="mt-24 font-sans text-slate-900 font-[500] text-3xl">{title}</span>
          </div>
          <div className="mt-2">
            <span className="font-sans text-slate-900 font-[400] text-lg">用户登陆</span>
          </div>
          <form className="flex flex-col items-center gap-y-4 mt-12 mx-16 w-full">
            <input className="h-8 px-5 py-2 w-2/3 ring-1 ring-slate-200 rounded-full" placeholder="用户名"></input>
            <input className="h-8 px-5 py-2 w-2/3 ring-1 ring-slate-200 rounded-full" placeholder="密码"></input>
            <button className="mt-4 w-2/3 h-8 bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-xl ">登陆</button>
          </form>
          <div className="mt-2">
            <span className="font-sans text-slate-400 font-[200] text-sm">没有账户？请先<a>注册</a></span>
          </div>
          <span className="mt-auto mb-4 inline-flex justify-center">
            <a
              href={github}
              className="text-gray-700 inline-flex justify-center items-center"
            >
              <Github className="mx-3" />
              {footer}
            </a>
          </span>
        </div>
        <div className="border-l flex invisible w-0 md:visible md:w-1/2 h-full">
          <img className="object-cover" src="images/login.png"></img>
        </div>
      </div>
    </div>
  );
}
