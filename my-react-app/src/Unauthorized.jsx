import { Link } from "react-router-dom";

const Unauthorized = () => {
    return (
        <main className="login-body flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md space-y-4 rounded-lg border border-[#3B2A20]/10 bg-[#F7F1E8] p-8 text-center shadow-xs">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-[#A65A34]/10 text-[#A65A34]">
                    <svg
                        className="h-7 w-7"
                        aria-hidden="true"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                    >
                        <rect x="4" y="11" width="16" height="10" rx="2" />
                        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                </div>

                <p className="text-sm font-medium text-[#A65A34]">Error 403</p>

                <h1 className="text-2xl font-semibold text-[#3B2A20]">
                    Access denied
                </h1>

                <p className="text-sm leading-relaxed text-[#3B2A20]/70">
                    Your account doesn't have permission to view this page. If you
                    think this is a mistake, sign in with a different account or
                    contact an administrator.
                </p>

                <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                    <Link
                        to="/browse"
                        className="block w-full rounded-lg bg-[#A65A34] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#8A9A5B] focus:outline-none focus:ring-2 focus:ring-[#A65A34] focus:ring-offset-2 focus:ring-offset-[#F7F1E8]"
                    >
                        Return home
                    </Link>
                    <Link
                        to="/login"
                        className="block w-full rounded-lg border border-[#3B2A20]/20 bg-white px-6 py-3 text-sm font-medium text-[#3B2A20] transition-colors hover:border-[#A65A34] hover:text-[#A65A34] focus:outline-none focus:ring-2 focus:ring-[#A65A34] focus:ring-offset-2 focus:ring-offset-[#F7F1E8]"
                    >
                        Sign in again
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default Unauthorized;