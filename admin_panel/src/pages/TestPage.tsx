import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Style Test Page
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Test Card 1 */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-xl p-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold">Glassmorphism Card</h3>
            </div>
            <p className="text-slate-600">This card should have a glass effect with blur and transparency.</p>
          </div>

          {/* Test Card 2 */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold">Gradient Card</h3>
            </div>
            <p className="text-white/90">This card should have a colorful gradient background.</p>
          </div>

          {/* Test Card 3 */}
          <div className="bg-white rounded-xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold">Regular Card</h3>
            </div>
            <p className="text-slate-600">This is a regular white card with shadow.</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-8 border border-white/20 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-slate-800">Color Test</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-20 bg-blue-500 rounded-lg flex items-center justify-center text-white font-semibold">Blue</div>
            <div className="h-20 bg-purple-500 rounded-lg flex items-center justify-center text-white font-semibold">Purple</div>
            <div className="h-20 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-semibold">Emerald</div>
            <div className="h-20 bg-orange-500 rounded-lg flex items-center justify-center text-white font-semibold">Orange</div>
          </div>
        </div>

        <div className="text-center">
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestPage;