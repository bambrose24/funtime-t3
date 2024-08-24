import Link from "next/link";
import { Button } from "~/components/ui/button";

export function FuntimeLanding() {
  return (
    <main className="flex-1">
      <section className="w-full py-8 md:py-16 lg:py-24 xl:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Welcome to Funtime
              </h1>
              <p className="mx-auto max-w-[700px] text-foreground md:text-xl">
                The ultimate NFL pick &apos;em platform. Create or join a
                season-long league and test your prediction skills!
              </p>
            </div>
            <div className="flex w-full max-w-sm flex-col gap-4">
              <Link href="/signup" className="w-full">
                <Button className="w-full">Sign up</Button>
              </Link>
              <Link href="/login" className="w-full">
                <Button variant="secondary" className="w-full">
                  Log in
                </Button>
              </Link>
              {/* <Link href="/league/create">
                <Button>Create a League</Button>
              </Link> */}
              {/* <Link href="/league/join">
                <Button>Join a League</Button>
              </Link> */}
            </div>
          </div>
        </div>
      </section>
      <section className="w-full bg-secondary py-8 md:py-16 lg:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 rounded-lg border-gray-800 p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-2 h-10 w-10"
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
              <h2 className="text-xl font-bold">Compete with Friends</h2>
              <p className="text-center text-sm text-gray-500">
                Create private leagues and invite your friends for a season of
                friendly competition.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border-gray-800 p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-2 h-10 w-10"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              <h2 className="text-xl font-bold">Weekly Picks</h2>
              <p className="text-center text-sm text-gray-500">
                Make your predictions each week and track your progress
                throughout the season.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border-gray-800 p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-2 h-10 w-10"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h2 className="text-xl font-bold">Multiple Leagues</h2>
              <p className="text-center text-sm text-gray-500">
                Join or create multiple leagues to maximize your football fun.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-8 md:py-16 lg:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Ready to join the fun?
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl">
                Sign up now to create your own league or join an existing one.
                It&apos;s free and easy to get started!
              </p>
            </div>
            <Link href="/signup" className="w-full max-w-sm">
              <Button className="w-full">Sign up</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
