"use client";

import { useState, useEffect, useRef } from "react";
import { Github, InfoCircleFill } from "react-bootstrap-icons";
import { title, github, footer, backEndBase } from "./config";

enum AlertType {
  INFO,
  SUCCESS,
  DANGER
}

function Alert({ status, msg, alertType }: { status: boolean, msg: string, alertType: AlertType }) {
  let alertStyle = "";
  if (!status) {
    alertStyle += "invisible";
  } else {
    alertStyle += "visible";
  }
  let typeColor = "blue";
  if (alertType == AlertType.SUCCESS) {
    typeColor = "green";
  } else if (alertType == AlertType.DANGER) {
    typeColor = "red";
  }
  alertStyle += " text-" + typeColor + "-800 bg-" + typeColor + "-100"
  return (
    <div className={`${alertStyle} w-2/3 h-auto top-4 absolute inline-flex justify-center items-center p-2 text-sm rounded-lg`} role="alert">
      <div>
        <InfoCircleFill className="flex-shrink-0 inline w-4 h-4 mr-1"></InfoCircleFill>{msg}
      </div>
    </div>
  )
}

export default function index() {
  const [alertType, setAlertTypeState] = useState(AlertType.INFO);
  const [alertStatusState, setAlertStatusState] = useState(false);
  const [alertMsgState, setAlertMsgState] = useState("");
  const [userNameValue, setUserNameValue] = useState("");
  const [passWordValue, setPassWordValue] = useState("");

  function alertInfo(type: AlertType, msg: string) {
    setAlertStatusState(true);
    setAlertTypeState(type);
    setAlertMsgState(msg);
  }

  async function login() {
    try {
      const response = await fetch(
        backEndBase + "/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: userNameValue, password: passWordValue }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        console.log(data)
        if (data.status == 1) {
          alertInfo(AlertType.DANGER, data.msg);
        } else {
          localStorage.setItem('access_token', data.access_token);
          alertInfo(AlertType.SUCCESS, data.msg);
          window.location.href = '/hub';
        }
      } else {
        throw (null);
      }
    } catch (error) {
      setAlertStatusState(true);
      alertInfo(AlertType.DANGER, "登陆接口异常");
    }
  }

  return (
    <div className="fixed items-center justify-center bg-white flex w-screen h-screen">
      <div className="flex flex-row md:ring-1 md:ring-slate-200 md:shadow-xl rounded-xl w-[95%] md:w-[70%] h-[70%] overflow-hidden">
        <div className="relative flex flex-col items-center w-full md:w-1/2 h-full">
          <div className="mt-16 md:mt-24">
            <span className="mt-24 font-sans text-slate-900 font-[500] text-3xl">{title}</span>
          </div>
          <div className="mt-2">
            <span className="font-sans text-slate-900 font-[400] text-lg">用户登陆</span>
          </div>
          <Alert alertType={alertType} status={alertStatusState} msg={alertMsgState}></Alert>
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col items-center gap-y-4 mt-12 mx-16 w-full">
            <div className="w-2/3 ring-1 ring-slate-300 rounded-xl">
              <input value={userNameValue} onChange={(e) => setUserNameValue(e.target.value)} className="h-8 px-5 py-2 w-full h-full rounded-xl" placeholder="用户名"></input>
            </div>
            <div className="w-2/3 ring-1 ring-slate-300 rounded-xl">
              <input type="password" onChange={(e) => setPassWordValue(e.target.value)} value={passWordValue} className="h-8 px-5 py-2 w-full h-full rounded-xl" placeholder="密码"></input>
            </div>
            <button type="submit" onClick={login} className="mt-4 w-2/3 h-8 bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-xl ">登陆</button>
          </form>
          <div className="mt-2">
            <span className="font-sans text-slate-400 font-[200] text-sm">没有账户？请先<button className="text-blue-900" onClick={() => { alertInfo(AlertType.INFO, "内测阶段，暂时未开放注册。") }}>注册</button></span>
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
