import { SolapiMessageService } from "solapi";

const solapiMsgService = new SolapiMessageService(
    process.env.SOLAPI_API_KEY || "",
    process.env.SOLAPI_API_SECRET || ""
);

export const sendSms = async (to: string, text: string) => {
    if (!process.env.SOLAPI_API_KEY || !process.env.SOLAPI_API_SECRET || !process.env.SOLAPI_SENDER_NUMBER) {
        console.warn("SOLAPI credentials or sender number not set. Skipping SMS to:", to, "Text:", text);
        return;
    }

    // Remove any hyphens or spaces from the phone number just in case
    const cleanTo = to.replace(/[^0-9]/g, "");

    try {
        const response = await solapiMsgService.sendOne({
            to: cleanTo,
            from: process.env.SOLAPI_SENDER_NUMBER,
            text,
        });
        console.log("Solapi SMS sent successfully:", response);
        return response;
    } catch (error) {
        console.error("Failed to send SMS via Solapi", error);
        throw error; // Or handle silently depending on requirement
    }
};
