import { NextResponse } from "next/server";
import { writeFile, readFile, access } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const SUBSCRIBERS_FILE = join(DATA_DIR, "subscribers.json");

interface Subscriber {
  email: string;
  subscribedAt: string;
}

async function getSubscribers(): Promise<Subscriber[]> {
  try {
    await access(SUBSCRIBERS_FILE);
    const data = await readFile(SUBSCRIBERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveSubscribers(subscribers: Subscriber[]): Promise<void> {
  await writeFile(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2), "utf-8");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "請輸入有效的 Email 格式" },
        { status: 400 }
      );
    }

    const subscribers = await getSubscribers();

    if (subscribers.some((s) => s.email === email)) {
      return NextResponse.json(
        { error: "這個 Email 已經訂閱過了！" },
        { status: 409 }
      );
    }

    subscribers.push({
      email,
      subscribedAt: new Date().toISOString(),
    });

    await saveSubscribers(subscribers);

    return NextResponse.json({
      success: true,
      message: "訂閱成功！",
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "伺服器錯誤，請稍後再試" },
      { status: 500 }
    );
  }
}