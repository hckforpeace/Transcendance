"use strict";
function isLoggedIn() {
    fetch("/api/isLoggedIn", {
        method: "GET",
        credentials: "include"
    })
        .then(response => {
        if (response.ok)
            return true;
        return (false);
    });
    return (false);
}
