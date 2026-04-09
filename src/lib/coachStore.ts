type Msg = { role: "user" | "assistant"; content: string; images?: string[] };

const MESSAGES_KEY = "safevin_coach_messages_v1";
const IMAGES_KEY = "safevin_coach_images_v1";

export const saveCoachMessages = (messages: Msg[]) => {
  try {
    // Don't save images inline to avoid quota issues
    const clean = messages.map(({ images, ...rest }) => rest);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(clean));
  } catch {}
};

export const loadCoachMessages = (): Msg[] => {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const saveCoachImages = (images: string[]) => {
  try {
    localStorage.setItem(IMAGES_KEY, JSON.stringify(images));
  } catch {}
};

export const loadCoachImages = (): string[] => {
  try {
    const raw = localStorage.getItem(IMAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const clearCoachChat = () => {
  localStorage.removeItem(MESSAGES_KEY);
  localStorage.removeItem(IMAGES_KEY);
};
