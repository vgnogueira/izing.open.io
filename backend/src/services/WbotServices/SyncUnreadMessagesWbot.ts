import { Client } from "whatsapp-web.js";
import { logger } from "../../utils/logger";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
// import verifyBusinessHours from "./helpers/VerifyBusinessHours";
import VerifyContact from "./helpers/VerifyContact";
import VerifyMediaMessage from "./helpers/VerifyMediaMessage";
import VerifyMessage from "./helpers/VerifyMessage";

interface Session extends Client {
  id?: number;
}

const SyncUnreadMessagesWbot = async (
  wbot: Session,
  tenantId: number | string
): Promise<void> => {
  const chats = await wbot.getChats();
  await Promise.all(
    chats.map(async chat => {
      if (chat.unreadCount > 0) {
        const unreadMessages = await chat.fetchMessages({
          limit: chat.unreadCount
        });
        logger.info(`CHAT: ${chat}`);

        if (chat.isGroup) {
          return;
        }
        const chatContact = await chat.getContact();
        const contact = await VerifyContact(chatContact, tenantId);
        const ticket = await FindOrCreateTicketService(
          contact,
          wbot.id!,
          chat.unreadCount,
          tenantId
        );

        if (ticket?.isCampaignMessage) {
          return;
        }

        unreadMessages.map(async msg => {
          logger.info(`MSG: ${msg}`);
          if (msg.hasMedia) {
            await VerifyMediaMessage(msg, ticket, contact);
          } else {
            await VerifyMessage(msg, ticket, contact);
          }
          // await verifyBusinessHours(msg, ticket);
        });
      }
    })
  );
};

export default SyncUnreadMessagesWbot;
