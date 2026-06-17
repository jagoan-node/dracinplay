export default function Footer() {
  return (
    <footer className="hidden lg:block bg-[#0a0a0f] border-t border-white/5 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#e63946] rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">
              Dracin<span className="text-[#e63946]">Play</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 text-center">
            DracinPlay &copy; {new Date().getFullYear()}. Streaming data provided by Sonzai API.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-600">Built with Next.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
