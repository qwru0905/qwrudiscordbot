import {
	verifyKey,
	InteractionType,
	InteractionResponseType,
} from "discord-interactions";

export default {
	async fetch(request: Request, env: Env) {
		// 1. 서명 검증
		const signature = request.headers.get("X-Signature-Ed25519");
		const timestamp = request.headers.get("X-Signature-Timestamp");
		const body = await request.text(); // 파싱 전 원본 문자열이어야 합니다

		const isValid =
			signature &&
			timestamp &&
			(await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY));
		if (!isValid) return new Response("잘못된 서명", { status: 401 });

		const interaction = JSON.parse(body);

		// 2. 디스코드가 URL 등록 시 보내는 PING엔 PONG으로 답합니다
		if (interaction.type === InteractionType.PING) {
			return Response.json({ type: InteractionResponseType.PONG });
		}

		return new Response("알 수 없는 인터랙션", { status: 400 });
	},
};
