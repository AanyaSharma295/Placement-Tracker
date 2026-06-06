import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">

      {/* Logo + Name */}
      <h1 className="text-5xl font-bold text-white mb-2">
        Prep<span className="text-blue-500">Forge</span>
      </h1>

      <p className="text-gray-400 text-lg mb-10">
        Track. Practice. Revise. Get Placed.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-10 max-w-md w-full">
        <div className="bg-gray-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">4</p>
          <p className="text-gray-400 text-sm">Platforms Tracked</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">9+</p>
          <p className="text-gray-400 text-sm">Companies</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">7</p>
          <p className="text-gray-400 text-sm">XP Levels</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">∞</p>
          <p className="text-gray-400 text-sm">Consistency</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <Link
          href="/sign-up"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition"
        >
          Get Started
        </Link>

        <button className="border border-gray-600 hover:border-gray-400 text-gray-300 font-medium px-6 py-3 rounded-lg transition">
          Learn More
        </button>
      </div>

    </div>
  );
}