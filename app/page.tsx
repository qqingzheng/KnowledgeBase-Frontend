'use client'
import React, { useState, useEffect, useRef } from 'react';
import { title, footer, github, defaultResponse } from './config'
import { List } from 'postcss/lib/list';
import ReactMarkdown from 'react-markdown';


enum IdentityType {
	USER,
	ROBOT
}
interface Identity {
	identity: string,
	avatarUrl: string,
	nickName: string,
	type: IdentityType
}
interface ChatItem {
	type: IdentityType,
	content: string,
	appendix: Map<string, Array<any>>,
}
interface ChatHistory {
	history: Array<ChatItem>
}


function Chat({ userIdentity, robotIdentity, defaultChatHistory }: { userIdentity: Identity, robotIdentity: Identity, defaultChatHistory: ChatHistory }) {
	const [inputValue, setInputValue] = useState('');
	const [chatHistory, setChatHistory] = useState(defaultChatHistory);
	const [isLoading, setIsLoading] = useState(false);
	const chatHistoryCopy = chatHistory
	const inputRef = useRef(null);
	const chatHistoryRef = useRef(null);
	function StaticAddHistory(type: IdentityType, content: string) {
		chatHistoryCopy.history.push({
			type: type,
			content: content,
			appendix: new Map()
		})
		setChatHistory(chatHistoryCopy);
	}
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
		setInputValue('');
		StaticAddHistory(IdentityType.USER, query)
		StaticAddHistory(IdentityType.ROBOT, "")
		try {
			const response = await fetch('http://36.133.182.227:10005/chat/openai_ddgs', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ "prompt": query, "name": "test", "limit": 3 }),
			});

			const reader = response.body.getReader();
			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					break;
				}
				let resultList = new TextDecoder().decode(value).trim().split("\n");
				resultList.map((result, index) => {
					let jsonResult = JSON.parse(result);
					if ("metas" in jsonResult) {
						setChatHistory(prevHistory => {
							const newHistory = [...prevHistory.history];
							newHistory[newHistory.length - 1].content += jsonResult.response;
							newHistory[newHistory.length - 1].appendix = new Map(
								[
									["reference_urls", jsonResult.metas],
								])
							return { ...prevHistory, history: newHistory };
						});
					} else {
						setChatHistory(prevHistory => {
							const newHistory = [...prevHistory.history];
							newHistory[newHistory.length - 1].content += jsonResult.response;
							return { ...prevHistory, history: newHistory };
						});
					}
				})
			}

		} catch (error) {
			console.error("There was an error sending the message:", error);
		}
		setIsLoading(false);
		inputRef.current.focus();
	}

	if (chatHistoryCopy.history.length === 0) {
		StaticAddHistory(IdentityType.ROBOT, defaultResponse)
	}
	return (
		<div className="flex flex-col w-full relative min-w-screen max-w-screen min-h-screen max-h-screen">
			<div className="h-5/6 mx-6">
				<div className="flex flex-col p-5 rounded-t-2xl bg-gray-100 h-[85%] overflow-y-scroll" ref={chatHistoryRef}>
					<ul role="list" className="flex flex-col gap-y-3">
						{
							chatHistory.history.map((chatitem, index) => {
								if (chatitem.type == IdentityType.USER) {
									return (
										<li key={index} className="flex flex-col gap-y-1 p-2">
											<div className="flex items-center gap-x-2">
												<img className="h-10 w-10 flex-none rounded-full bg-gray-50" src={userIdentity.avatarUrl} alt="" />
												<div className="min-w-0 flex-auto">
													<p className="text-normal font-semibold leading-6 text-gray-900">{userIdentity.nickName}</p>
												</div>
											</div>
											<ReactMarkdown className="mx-10">{chatitem.content}</ReactMarkdown>
										</li>
									)
								} else {
									return (
										<li key={index} className="flex flex-col gap-y-1 bg-white rounded-lg overflow-hidden">
											<div style={{ display: isLoading && index === chatHistory.history.length - 1 ? 'block' : 'none' }} className="relative bg-blue-200 h-1 rounded-full w-full bg-gradient-to-r animate-pulse from-blue-400 via-pink-600 to-blue-700 repeat-x"></div>
											<div className="p-5 flex flex-col gap-y-1">
												<div className="flex items-center gap-x-2">
													<img className="h-10 w-10 flex-none rounded-full bg-gray-50" src={robotIdentity.avatarUrl} alt="" />
													<div className="min-w-0 flex-auto">
														<p className="text-normal font-semibold leading-6 text-gray-900">{robotIdentity.nickName}</p>
													</div>
												</div>
												<ReactMarkdown className="mx-10">{chatitem.content}</ReactMarkdown>
												{
													Array.from(chatitem.appendix.entries()).length > 0 ? <div className="m-3 border-t"></div> : null
												}
												{
													Array.from(chatitem.appendix.entries()).map(([key, value]) => {
														if (key == "reference_urls" && value.length > 0) {
															return (
																	<div className="flex flex-wrap items-center mx-10 text-sm gap-x-2 gap-y-1">参考网址：
																		{
																			value.map((refItem, refIndex) => {
																				return (
																					<a key={refIndex} href={refItem.source} target="_blank" className="inline-block w-24 h-5 truncate bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded whitespace-nowrap">{refItem.title}</a>
																				)
																			})
																		}
																	</div>
															)
														} else {
															return <div id="refs"></div>;
														}

													})
												}

											</div>

										</li>
									)
								}
							})
						}
					</ul>
				</div>
				<form onSubmit={e => e.preventDefault()}>
					<div className="relative flex flex-row gap-x-5 p-5 items-center rounded-b-2xl bg-gray-100 h-[15%] w-full">
						<input
							ref={inputRef}
							className="rounded-full px-5 py-2 w-11/12"
							placeholder="输入你的问题..."
							value={inputValue}
							disabled={isLoading}
							onChange={e => setInputValue(e.target.value)}
						/>
						<button type="submit" disabled={isLoading} onClick={sendMessage} className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 inline-flex justify-center items-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
							<path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
						</svg></button>
					</div>
				</form>

			</div>

		</div>
	)
}

interface Conversation {
	id: Number,
	displayName: string,
	selected: boolean,
	date: Date,
}

function Siderbar({ isOpen, conversations }: { isOpen: boolean, conversations: Array<Conversation> }) {

	const sidebarStyle = isOpen ? "w-64" : "w-0";
	const transformStyle = isOpen ? "translate-x-0" : "-translate-x-full";

	return (
		<div className='relative min-h-screen'>
			<div className={`${sidebarStyle} transform ${transformStyle} truncate relative top-0 left-0 h-5/6`} style={{ transition: 'transform 0.3s ease-in-out, width 0.3s ease-in-out' }}>
				<div className="flex flex-col px-8 h-full">
					<button className="inline-flex justify-center items-center w-full h-8 rounded-full bg-gray-100 hover:bg-gray-300 text-sm">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="mr-4" fill="currentColor" viewBox="0 0 16 16">
							<path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
						</svg>
						新的对话
					</button>
					<span className="text-xs mt-5 font-semibold">近期对话</span>
					<div className="mt-2"></div>
					<div className="flex flex-col">
						{
							conversations.map((conversation, index) => {
								let selectedFontFormat: string = "";
								let selectedButtonFormat: string = "bg-gray-100 hover:bg-gray-200 active:bg-gray-300";
								if (conversation.selected) {
									selectedFontFormat = "font-bold";
									selectedButtonFormat = "bg-green-200 hover:bg-green-300";
								}
								return (
									<button key={index} className={`mt-2 inline-flex items-center w-full h-7 rounded-full ${selectedButtonFormat} text-xs`}>
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="mx-5" fill="currentColor" viewBox="0 0 16 16">
											<path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z" />
											<path d="M5 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 8zm0-2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-1-5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM4 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm0 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" />
										</svg>
										<span className={`truncate pr-3 ${selectedFontFormat}`}>{conversation.displayName}</span>
									</button>
								)
							})
						}
					</div>
					<span className="mt-auto inline-flex justify-center">
						<a href={github} className="text-gray-700 inline-flex justify-center items-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mx-3" viewBox="0 0 16 16">
							<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
						</svg>{footer}</a>
					</span>
				</div>
			</div>
		</div>
	)
}

function Nav({ toggleSidebar, }: { toggleSidebar: any }) {
	return (
		<div id="header">
			<div className="flex items-center p-4">
				<button onClick={toggleSidebar} className="inline-flex justify-center items-center w-10 h-10 mr-2 rounded-full hover:bg-gray-200 hover:text-white text-gray-500">
					<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
						<path fill-rule="evenodd" d="M2 12.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
					</svg>
				</button>
				<span>{title}</span>
				<span className="ml-1 inline-flex items-center rounded-md bg-red-50 px-1 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Demo</span>
			</div>
		</div>
	)
}

function Content({ isOpen, conversations, userIdentity, robotIdentity, chatHistory }: { isOpen: boolean, conversations: Array<Conversation>, userIdentity: Identity, robotIdentity: Identity, chatHistory: ChatHistory }) {
	return (
		<div className="flex flex-row">
			<Siderbar isOpen={isOpen} conversations={conversations} />
			<Chat userIdentity={userIdentity} robotIdentity={robotIdentity} defaultChatHistory={chatHistory} />
		</div>
	)
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
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);
	const toggleSidebar = () => {
		setIsOpen(!isOpen);
	};
	let conversations: Array<Conversation>;
	conversations = new Array();
	conversations.push({ id: 0, displayName: "你好，请问什么是承租人优先权", selected: true, date: new Date() });
	conversations.push({ id: 0, displayName: "请问你叫什么名字", selected: false, date: new Date() });

	let userIdentity: Identity = { identity: "chestnut", nickName: "Chestnut", avatarUrl: "https://avatars.githubusercontent.com/u/88202804?v=4", type: IdentityType.USER };
	let robotIdentity: Identity = { identity: "robot", nickName: "Robot", avatarUrl: "https://avatars.githubusercontent.com/u/105474769?s=200&v=4", type: IdentityType.ROBOT };
	let chatHistory: ChatHistory = {
		history: new Array(),
	};
	return (
		<main className="fixed flex flex-col bg-white min-w-full">
			<Nav toggleSidebar={toggleSidebar} />
			<Content isOpen={isOpen} conversations={conversations} userIdentity={userIdentity} robotIdentity={robotIdentity} chatHistory={chatHistory} />
		</main>
	)
}

