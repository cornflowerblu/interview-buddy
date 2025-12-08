export default function DesignDemo() {
  return (
    <div className="min-h-screen p-8 bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
            Interview Buddy Design System
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Color palette, components, and visual examples
          </p>
        </div>

        {/* Primary Colors */}
        <section>
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
            Primary Colors (Trust Blue)
          </h2>
          <div className="grid grid-cols-6 md:grid-cols-11 gap-2">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
              <div key={shade} className="space-y-2">
                <div
                  className={`h-20 rounded-lg bg-primary-${shade} border border-neutral-200 dark:border-neutral-700`}
                />
                <div className="text-xs text-center">
                  <div className="font-mono text-neutral-700 dark:text-neutral-300">{shade}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Neutral Colors */}
        <section>
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
            Neutral Colors
          </h2>
          <div className="grid grid-cols-6 md:grid-cols-11 gap-2">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
              <div key={shade} className="space-y-2">
                <div
                  className={`h-20 rounded-lg bg-neutral-${shade} border border-neutral-200 dark:border-neutral-700`}
                />
                <div className="text-xs text-center">
                  <div className="font-mono text-neutral-700 dark:text-neutral-300">{shade}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Semantic Colors */}
        <section>
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
            Semantic Colors
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Success */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Success
              </h3>
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-success-50 border border-success-200" />
                <div className="h-16 rounded-lg bg-success-500 border border-success-600" />
                <div className="h-16 rounded-lg bg-success-700 border border-success-800" />
              </div>
            </div>

            {/* Warning */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Warning
              </h3>
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-warning-50 border border-warning-200" />
                <div className="h-16 rounded-lg bg-warning-500 border border-warning-600" />
                <div className="h-16 rounded-lg bg-warning-700 border border-warning-800" />
              </div>
            </div>

            {/* Error */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Error
              </h3>
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-error-50 border border-error-200" />
                <div className="h-16 rounded-lg bg-error-500 border border-error-600" />
                <div className="h-16 rounded-lg bg-error-700 border border-error-800" />
              </div>
            </div>

            {/* Info */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Info
              </h3>
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-info-50 border border-info-200" />
                <div className="h-16 rounded-lg bg-info-500 border border-info-600" />
                <div className="h-16 rounded-lg bg-info-700 border border-info-800" />
              </div>
            </div>
          </div>
        </section>

        {/* Component Examples */}
        <section>
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
            Component Examples
          </h2>
          
          {/* Status Badges */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Status Badges
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                Uploading
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-info-50 text-info-700 dark:bg-info-950 dark:text-info-300">
                Uploaded
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-warning-50 text-warning-700 dark:bg-warning-950 dark:text-warning-300">
                Transcribing
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-warning-50 text-warning-700 dark:bg-warning-950 dark:text-warning-300">
                Analyzing
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-50 text-success-700 dark:bg-success-950 dark:text-success-300">
                ✅ Complete
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-error-50 text-error-700 dark:bg-error-950 dark:text-error-300">
                Failed
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-4 mt-8">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Buttons
            </h3>
            <div className="flex flex-wrap gap-2">
              <button className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2">
                Primary Action
              </button>
              <button className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium px-6 py-3 rounded-lg transition-colors">
                Secondary Action
              </button>
              <button className="text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 font-medium px-4 py-2 rounded-lg transition-colors">
                Ghost Action →
              </button>
              <button className="bg-error-500 hover:bg-error-600 text-white font-medium px-6 py-3 rounded-lg transition-colors">
                Delete
              </button>
            </div>
          </div>

          {/* Interview Card Preview */}
          <div className="space-y-4 mt-8">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Interview Card (Preview)
            </h3>
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 max-w-md hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                    Amazon
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    SWE II • Behavioral • 42 mins
                  </p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-50 text-success-700 dark:bg-success-950 dark:text-success-300">
                  ✅ Complete
                </span>
              </div>

              {/* Score */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-neutral-600 dark:text-neutral-400">Overall Score</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-50">78/100</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 transition-all duration-300"
                    style={{ width: '78%' }}
                  />
                </div>
              </div>

              <button className="w-full text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-left">
                View Analysis →
              </button>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
            Typography
          </h2>
          <div className="space-y-2">
            <p className="text-5xl font-semibold text-neutral-900 dark:text-neutral-50">
              Hero Text (5xl)
            </p>
            <p className="text-4xl font-semibold text-neutral-900 dark:text-neutral-50">
              Page Title (4xl)
            </p>
            <p className="text-3xl font-semibold text-neutral-900 dark:text-neutral-50">
              Section Heading (3xl)
            </p>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
              Subsection (2xl)
            </p>
            <p className="text-xl text-neutral-700 dark:text-neutral-300">
              Emphasized Body (xl)
            </p>
            <p className="text-base text-neutral-700 dark:text-neutral-300">
              Body Text (base) - This is the default text size for content. It should be easy to read and comfortable for long-form text.
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Secondary Text (sm) - Used for labels, captions, and helper text.
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-500">
              Caption Text (xs) - Used for timestamps, metadata, and fine print.
            </p>
            <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 mt-4">
              Monospace Text - Used for code, timestamps, and data display
            </p>
          </div>
        </section>

        {/* Recording Window Preview */}
        <section>
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
            Recording Window (Minimal)
          </h2>
          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-12 flex items-center justify-center">
            <div className="flex items-center gap-3 px-4 py-2 bg-white/30 dark:bg-black/30 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 rounded-full shadow-lg opacity-30 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-error-500 animate-pulse" />
                <span className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
                  02:34
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                <button className="hover:text-neutral-900 dark:hover:text-neutral-100">⏸</button>
                <button className="hover:text-error-500">⏹</button>
              </div>
            </div>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center mt-2">
            Hover over the recording window to see controls
          </p>
        </section>

        {/* Dark Mode Toggle Hint */}
        <section className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-6 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            💡 Toggle your system dark mode to see the color palette adapt automatically
          </p>
        </section>
      </div>
    </div>
  );
}
