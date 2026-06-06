import { UserButton } from "@clerk/nextjs";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4 relative">

      {/* Top bar */}
      <div className="absolute top-4 right-4">
        <UserButton afterSignOutUrl="/" />
      </div>

      <h1 className="text-3xl font-bold">Welcome to PrepForge!</h1>
      <p className="text-gray-400">Your dashboard is being built.</p>
    </div>
  );
}