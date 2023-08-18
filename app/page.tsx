import { title } from "./config";

function NavLeftFunc() {
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
      {titleComponent}
      {stateComponent}
    </div>
  );
}

export default function Nav() {
  return (
    <div className="bg-white fixed flex w-screen">
      <div className="w-11/12 mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-100 px-6 pt-16 shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
          <svg
            viewBox="0 0 1024 1024"
            className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
            aria-hidden="true"
          >
            <circle
              cx="512"
              cy="512"
              r="512"
              fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
              fill-opacity="0.7"
            />
            <defs>
              <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
                <stop stop-color="#3896f0" />
                <stop offset="1" stop-color="#121356" />
              </radialGradient>
            </defs>
          </svg>
          <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
              构建你的私人知识库
              <br />
              知识有无限可能
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-700">
              在信息爆炸的时代，知识是最宝贵的财富，而我们的产品将帮助你将这些财富汇集成一座璀璨的智慧宝库。无论是学术探索、个人成长，还是职业发展，我们的产品都将成为你展翅高飞的翅膀。
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
              <a
                href="/chat"
                className="inline-flex items-center justify-center w-32 rounded-md bg-blue-800 hover:bg-blue-900 px-3.5 py-2.5 text-sm font-semibold text-white hover:text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                开始！
              </a>
              <a
                href="#"
                className="text-sm font-semibold leading-6 text-blue-800 hover:text-blue-900"
              >
                了解更多 <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          <div className="relative mt-16 h-80 lg:mt-8">
            <img
              className="absolute left-0 top-0 w-[57rem] max-w-none rounded-md bg-white/5 ring-1 ring-white/10"
              src="/images/demo.png"
              alt="App screenshot"
              width="1824"
              height="1080"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
