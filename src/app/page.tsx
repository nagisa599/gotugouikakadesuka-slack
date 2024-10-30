import Link from "next/link";
import Calendar from "~/app/_components/Calender";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          ご都合以下かですか
          <span className="text-[hsl(280,100%,70%)]">Slack</span>
        </h1>
        <Calendar />
      </div>
    </main>
  );
}
