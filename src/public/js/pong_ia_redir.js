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
function pong_ia_redir() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!username)
            return;
        try {
            const response = yield fetch("/pong_ia");
            const html = yield response.text();
            const content = document.getElementById("content-div");
            if (!content)
                throw new Error("Content div not found");
            content.innerHTML = html;
            load_script(username, "Bot");
            var left_name = document.getElementById("left-player-name");
            if (left_name)
                left_name.innerHTML = username;
        }
        catch (err) {
            console.error("Error loading pong_ia view:", err);
        }
    });
}
