import { RegisterDto, LoginDto } from "./user/apiUser";

export const BASE_URL = "http://localhost:3000/api";

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