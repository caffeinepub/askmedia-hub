import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Answer {
    body: string;
    authorName: string;
    questionId: bigint;
}
export interface Question {
    id: bigint;
    title: string;
    body: string;
    authorName: string;
}
export interface MediaItem {
    id: bigint;
    title: string;
    uploaderName: string;
    blob: ExternalBlob;
    description: string;
    mediaType: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createMediaItem(title: string, description: string, blob: ExternalBlob, mediaType: string, uploaderName: string): Promise<bigint>;
    createQuestion(title: string, body: string, authorName: string): Promise<bigint>;
    deleteMediaItem(id: bigint): Promise<void>;
    getAllMediaItems(): Promise<Array<MediaItem>>;
    getAllQuestions(): Promise<Array<Question>>;
    getAnswersForQuestion(questionId: bigint): Promise<Array<Answer>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getQuestion(id: bigint): Promise<Question>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    postAnswer(questionId: bigint, body: string, authorName: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
