import type { MessagingPort } from "./messaging-ports";
export const messaging: MessagingPort = {
  async sendMagicLink(to, url) {
    console.log("MAGIC LINK (DEV) ->", to, url);
  }
};
