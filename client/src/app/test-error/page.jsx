export const dynamic = "force-dynamic";

export default async function TestError() {
    await new Promise(res => setTimeout(res, 100));
    throw new Error("Runtime error");
  }