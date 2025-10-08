"use client";

export default function MainContent() {
  return (
    <main className="flex-1 flex flex-col h-screen">
      {/* Chat Message Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Välkommen till AI Studie Mentor
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Ladda upp dokument och ställ frågor för att få studiehjälp på
              svenska
            </p>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 mb-6">
              <div className="text-center">
                <div className="text-4xl mb-4">📄</div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Ladda upp dokument
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Dra och släpp filer här eller klicka för att välja
                </p>
                <button className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  Välj filer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4">
            <div className="flex-1">
              <textarea
                placeholder="Ställ en fråga om dina dokument..."
                rows={3}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium self-end">
              Skicka
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
