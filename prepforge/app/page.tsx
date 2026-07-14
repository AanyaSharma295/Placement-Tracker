import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a18] text-white flex flex-col items-center justify-center px-4 py-16">

      {/* Hero: text + illustration side by side */}
      <div className="w-full max-w-5xl flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-16">

        {/* Left: copy */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-5xl font-bold text-white mb-2">
            Prep<span className="text-[#8B5CF6]">Forge</span>
          </h1>

          <p className="text-2xl font-semibold text-gray-100 mb-3">
            From first problem to first offer.
          </p>

          <p className="text-[#6b6b85] text-base leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
            Master DSA • Revise Core CS • Practice Company Questions • Track Your Progress
          </p>

          <div className="flex gap-4 justify-center lg:justify-start">
            <Link
              href="/sign-up"
              className="text-white font-medium px-6 py-3 rounded-lg transition hover:opacity-90"
              style={{ background: "#8B5CF6" }}
            >
              Get Started
            </Link>

            <button
              className="font-medium px-6 py-3 rounded-lg transition hover:bg-white/5"
              style={{
                border: "1px solid #8B5CF630",
                color: "#b8b8c8",
              }}
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Right: illustration */}
        <div className="flex-1 flex justify-center">
          <img
            src="/hero-illustration.svg"
            alt="Two developers pair programming"
            className="w-full max-w-sm lg:max-w-md"
          />
        </div>
      </div>

    </div>
  );
}