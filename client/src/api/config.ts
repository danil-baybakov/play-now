import { RegisterDto, LoginDto } from "./user/apiUser";

export const ORIGIN = "http://localhost:3000";

export const BASE_URL = `${ORIGIN}/api`;

export const REG_USER: RegisterDto = {
    username: "DanilBaybakov",
    password: "skillbox",
    firstName: "Danil",
    lastName: "Baybakov"
};

export const USER: LoginDto = {
    username: "DanilBaybakov",
    password: "skillbox",
};