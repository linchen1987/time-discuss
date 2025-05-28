import Navigation from '@/components/Navigation'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            欢迎来到
            <span className="text-indigo-600"> 朋友之家</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            一个温馨的社交平台，与朋友分享生活的美好时光
          </p>

          <div className="mt-10 flex justify-center space-x-6">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">分享动态</h3>
              <p className="text-gray-600">记录生活中的精彩瞬间，与朋友分享你的故事</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 max-w-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">互动交流</h3>
              <p className="text-gray-600">点赞、评论，与朋友们保持密切的互动联系</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 max-w-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">私密安全</h3>
              <p className="text-gray-600">只有朋友才能看到你的动态，保护你的隐私</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
