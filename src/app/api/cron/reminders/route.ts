import { NextResponse } from "next/server";
import { runDailyReminders } from "@/server/reminders";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runDailyReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Reminder cron failed", error);
    return NextResponse.json({ error: "Reminder job failed." }, { status: 500 });
  }
}
