import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Profile {
    displayName: string;
}
export type Time = bigint;
export interface DrawingMetadata {
    id: bigint;
    title: string;
    minutesSpent: bigint;
    createdAt: Time;
    description: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkPassword(passwordAttempt: string): Promise<boolean>;
    deleteDrawing(drawingId: bigint): Promise<void>;
    getAllDrawings(user: Principal): Promise<Array<DrawingMetadata>>;
    getCallerUserProfile(): Promise<Profile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyDrawings(): Promise<Array<DrawingMetadata>>;
    getProfile(user: Principal): Promise<Profile>;
    getTotalDrawings(user: Principal): Promise<bigint>;
    getTotalMinutesSpent(user: Principal): Promise<bigint>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: Profile): Promise<void>;
    saveDrawing(metadata: DrawingMetadata): Promise<void>;
}
