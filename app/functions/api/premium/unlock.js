export async function onRequestPost({ request, env }) {
  try {
    const { code } = await request.json();

    if (
      typeof code !== "string" ||
      !env.PREMIUM_ACCESS_CODE ||
      code.length !== 20
    ) {
      return Response.json(
        { success: false, message: "Invalid access code." },
        { status: 401 }
      );
    }

    if (code !== env.PREMIUM_ACCESS_CODE) {
      return Response.json(
        { success: false, message: "Incorrect access code." },
        { status: 401 }
      );
    }

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { success: false, message: "Request failed." },
      { status: 400 }
    );
  }
}
