import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  try {
    const { userId } = await auth();
    const userAgent = req.headers.get("user-agent") || "Unknown";

    // console.log("User-Agent:", userAgent); // Debugging line

    // Bot detection logic
    const botUserAgents = ["Googlebot", "python-requests", "Scrapy", "curl"];
    if (botUserAgents.some(bot => userAgent.includes(bot))) {
      console.warn("🚨 Bot detected! Blocking access.");
      return new Response("Bot detected", { status: 403 });
    }

    if (!userId && isProtectedRoute(req)) {
      const { redirectToSignIn } = await auth();
      return redirectToSignIn();
    }

  } catch (error) {
    console.error("Middleware error:", error);
    throw error;
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
