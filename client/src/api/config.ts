import { RegisterDto, LoginDto } from "./user/apiUser";

export const BASE_URL = "http://localhost:3000/api";

export const REG_USER: RegisterDto = {
    username: "Danil Baybakov",
    password: "skillbox",
    firstName: "Danil",
    lastName: "Baybakov"
};

export const USER: LoginDto = {
    username: "Danil Baybakov",
    password: "skillbox",
};