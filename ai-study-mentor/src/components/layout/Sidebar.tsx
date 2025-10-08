'use client'

export default function Sidebar() {
  return (
    <aside className="hidden md:block w-64 h-screen bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-700">
      <div className="flex flex-col h-full p-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Historik
          </h2>
          
          {/* New Conversation Button */}
          <button className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
            Ny Konversation
          </button>
        </div>

        {/* Session List Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {/* Placeholder for chat sessions */}
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              Inga konversationer än
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}