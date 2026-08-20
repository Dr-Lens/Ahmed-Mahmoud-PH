import { apiGet, apiPost } from "./client.js";
import type {
  SiteSettings,
  Category,
  Service,
  SocialLink,
  BeforeAfter,
} from "../types/index.js";

export const getSettings = () => apiGet<SiteSettings>("getSettings");
export const updateSettings = (patch: Partial<SiteSettings>) =>
  apiPost<SiteSettings>("updateSettings", { patch });

export const getCategories = () => apiGet<Category[]>("getCategories");

export const getServices = () => apiGet<Service[]>("getServices");
export const updateService = (service_id: string, patch: Partial<Service>) =>
  apiPost<Service>("updateService", { service_id, patch });

export const getSocial = () => apiGet<SocialLink[]>("getSocial");
export const updateSocial = (links: SocialLink[]) => apiPost<SocialLink[]>("updateSocial", { links });

export const getBeforeAfter = () => apiGet<BeforeAfter[]>("getBeforeAfter");
export const createBeforeAfter = (project: Omit<BeforeAfter, "project_id" | "created_at">) =>
  apiPost<BeforeAfter>("createBeforeAfter", { project });
export const deleteBeforeAfter = (project_id: string) => apiPost<void>("deleteBeforeAfter", { project_id });
