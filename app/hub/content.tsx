import React, { useState, useEffect, useRef } from "react";
import { ShareFill } from "react-bootstrap-icons";
import { title, github, footer, backEndBase } from "../config";
import { getMyAppInfo } from "../security/auth"

export function Content() {
    const [appList, setAppList] = useState([]);
    async function getAppList() {
        let myAppInfo = await getMyAppInfo();
        setAppList(myAppInfo.data);
        console.log(myAppInfo.data)
    }
    useEffect(() => {
        getAppList();

    }, [])

    return (
        <div className="w-screen min-h-screen max-h-screen ">
            <div className="h-[85%] w-full flex flex-col overflow-y-scroll">
                <div className="px-16">
                    <span className="font-[600] text-2xl w-full">应用列表</span>
                    <ul className="flex flex-row flex-wrap gap-x-4 gap-y-4 mt-4">
                        {appList.map((app: any, index: number) => (
                            <li key={index} className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow">
                                <div className="relative z-0 h-32 w-full rounded-t-xl p-1">
                                    <img src={app?.cover_img} alt="image" className="w-full h-full object-cover" />
                                    <div className="absolute rounded-t-xl inset-0 bg-gradient-to-t from-black to-transparent opacity-25"></div>
                                </div>

                                <div className="p-5">
                                    <a href="#">
                                        <h5 className="text-xl font-semibold tracking-tight text-gray-900">{app?.app_name}</h5>
                                    </a>
                                    <div className="flex items-center mt-2.5 mb-5">
                                        {Object.keys(app?.tags || {}).map((color: string, i: number) => (
                                            app?.tags[color].map((tag: string, j: number) => (
                                                <span key={`${i}-${j}`} className={`bg-${color}-100 text-${color}-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded`}>{tag}</span>
                                            ))
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-end gap-x-2">
                                        <a href="/chat" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">打开</a>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>




                </div>
            </div>
        </div>

    )
}