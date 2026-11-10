import fs from "node:fs/promises";
import { activeNotices, renderNoticeGuide } from "../src/data/siteNotices.js";

const notices = activeNotices(JSON.parse(await fs.readFile(new URL("../src/data/notices.json", import.meta.url), "utf8")));
const guide = new URL("../public/llms.txt", import.meta.url);
await fs.writeFile(guide, renderNoticeGuide(await fs.readFile(guide, "utf8"), notices));
