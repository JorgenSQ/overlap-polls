import { customAlphabet } from "nanoid";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const generatePollId = customAlphabet(alphabet, 8);
export const generateEditToken = customAlphabet(alphabet, 24);
export const generateOrganizerToken = customAlphabet(alphabet, 24);
