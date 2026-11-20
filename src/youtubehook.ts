import { getDiscordChannelIdsByYoutubeProfileCode, getVideoByExtID } from "@qwru/db";
import { YoutubeHookMessageBody } from "@qwru/types";
import { env } from "cloudflare:workers";
import { sendMessage } from "./discord";

export async function handleQueue(body: YoutubeHookMessageBody) {
	const ext_id = body.ext_id;
	const video = await getVideoByExtID(env.DB, ext_id);
	if (!video) return;

	const message = `\`${video.profile.name} 채널에 새로운 동영상이 올라왔습니다!\n\`` +
		`${video.title}\n` +
		`https://www.youtube.com/watch?v=${video.ext_id}\n`

	const channels = await getDiscordChannelIdsByYoutubeProfileCode(env.DB, video.profile.code);

	for (const channel of channels) {
		sendMessage(channel, message);
	}
}
