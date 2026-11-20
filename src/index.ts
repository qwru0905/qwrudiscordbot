import {
	verifyKey,
	InteractionType,
	InteractionResponseType,
} from "discord-interactions";
import * as youtubehook from "./youtubehook";
import { DiscordMessageBody } from "@qwru/types";

async function verifyDiscordRequest(request: Request, env: Env) {
	const signature = request.headers.get('x-signature-ed25519');
	const timestamp = request.headers.get('x-signature-timestamp');
	const body = await request.text();
	const isValidRequest =
		signature &&
		timestamp &&
		(await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY));
	if (!isValidRequest) {
		return { isValid: false };
	}

	return { interaction: JSON.parse(body), isValid: true };
}

export default {
	async fetch(request: Request, env: Env) {
		if (request.method !== "POST") {
			return new Response("Bad Request", { status: 400 });
		}

		const { isValid, interaction } = await verifyDiscordRequest(
			request,
			env,
		);
		if (!isValid || !interaction) {
			return new Response('Bad request signature.', { status: 401 });
		}

		// 2. 디스코드가 URL 등록 시 보내는 PING엔 PONG으로 답합니다
		if (interaction.type === InteractionType.PING) {
			return Response.json({ type: InteractionResponseType.PONG });
		}

		return new Response("알 수 없는 인터랙션", { status: 400 });
	},
	async queue(batch: MessageBatch<DiscordMessageBody>, env: Env, ctx: ExecutionContext): Promise<void> {
		for (const msg of batch.messages) {
			try {
				switch (msg.body.action) {
					case "youtube_hook":
						await youtubehook.handleQueue(msg.body);
						break;
				}
				msg.ack();
			} catch (e) {
				console.error(e);
				msg.retry();
			}
		}
	}
} satisfies ExportedHandler<Env, DiscordMessageBody>;
