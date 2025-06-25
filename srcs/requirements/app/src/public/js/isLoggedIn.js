"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function isLoggedIn() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("/api/isLoggedIn", {
                method: "GET",
                credentials: "include"
            });
            if (response.status == 400 || response.status == 404) {
                console.error("User doesn't exist");
                return (false);
            }
            if (response.status == 500) {
                console.error("Backend error");
                return (false);
            }
            const data = yield response.json();
            return (data.connected);
        }
        catch (err) {
            console.error("isLoggedIn error:", err);
            return false;
        }
    });
}
