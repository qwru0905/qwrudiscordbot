import { env } from "cloudflare:workers"

export async function sendMessage(
	channel_id: string,
	message: string,
) {
	const res = await fetch(
		`https://discord.com/api/v10/channels/${channel_id}/messages`,
		{
			method: "POST",
			headers: {
				Authorization: `Bot ${env.BOT_TOKEN}`,
				"Content-Type": "application/json",
				"User-Agent": "DiscordBot (https://discord.qwru0905.dev, 1.0)",
			},
			body: JSON.stringify({ content: message }),
		},
	);
}
