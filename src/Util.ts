import { openiap, config } from "@openiap/jsapi";
const { info, warn, err } = config;
export class User {
    public email: string = "";
    public name: string = "";
    public permissions: string = "";
    public role: string = "";
    public roles: string[] = [];
    public sub: string = "";
    public username: string = "";
}
export class Util {
    public static Users: User[] = [];
    public static client: openiap;
    public static Delay = ms => new Promise<void>(res => setTimeout(res, ms));
    public static IsNullUndefinded(obj: any) {
        if (obj === null || obj === undefined) {
            return true;
        }
        return false;
    }
    public static IsNullEmpty(obj: any) {
        if (obj === null || obj === undefined || obj === '') {
            return true;
        }
        return false;
    }
    public static IsString(obj: any) {
        if (typeof obj === 'string' || obj instanceof String) {
            return true;
        }
        return false;
    }
    public static isObject(obj: any): boolean {
        return obj === Object(obj);
    }
    public static GetUniqueIdentifier(): string {
        // crypto.randomBytes(16).toString("hex")
        return Math.random().toString(36).substring(2, 11);
    }
    public static parseBoolean(s: any): boolean {
        let val: string;
        if (typeof s === "number") {
            val = s.toString();
        } else if (typeof s === "string") {
            val = s.toLowerCase().trim();
        } else if (typeof s === "boolean") {
            val = s.toString();
        } else {
            throw new Error("Unknown type!");
        }
        switch (val) {
            case "true": case "yes": case "1": return true;
            case "false": case "no": case "0": case null: return false;
            default: return Boolean(s);
        }
    }
}