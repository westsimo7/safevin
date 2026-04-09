export type StudioDraftPhase = "recognition" | "missing_photos" | "input";

export interface StudioDraft {
  id: string;
  created_at: string;
  updated_at: string;
  first_image_url: string | null;
  categoria: string;
  incomplete_phase: StudioDraftPhase;
  incomplete_data: {
    analysis: any;
    previews: string[];
  };
}

const STORAGE_KEY = "safevin_studio_drafts_v1";
const CHANGE_EVENT = "safevin:studio-drafts-changed";

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const emitChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }
};

export const getStudioDraftsChangeEvent = () => CHANGE_EVENT;

export const readStudioDrafts = (): StudioDraft[] => {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeStudioDrafts = (drafts: StudioDraft[]) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  emitChange();
};

export const upsertStudioDraft = ({
  id,
  categoria,
  first_image_url,
  incomplete_phase,
  incomplete_data,
}: {
  id?: string | null;
  categoria: string;
  first_image_url: string | null;
  incomplete_phase: StudioDraftPhase;
  incomplete_data: StudioDraft["incomplete_data"];
}) => {
  const drafts = readStudioDrafts();
  const now = new Date().toISOString();
  const draftId = id || (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `draft-${Date.now()}`);
  const existing = drafts.find((draft) => draft.id === draftId);

  const nextDraft: StudioDraft = {
    id: draftId,
    created_at: existing?.created_at || now,
    updated_at: now,
    first_image_url,
    categoria,
    incomplete_phase,
    incomplete_data,
  };

  const nextDrafts = existing
    ? drafts.map((draft) => (draft.id === draftId ? nextDraft : draft))
    : [nextDraft, ...drafts];

  writeStudioDrafts(nextDrafts);
  return draftId;
};

export const removeStudioDraft = (id: string) => {
  const drafts = readStudioDrafts().filter((draft) => draft.id !== id);
  writeStudioDrafts(drafts);
};

export const countStudioDrafts = () => readStudioDrafts().length;
