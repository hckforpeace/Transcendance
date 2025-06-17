
function injectViewToContentDiv(data: string): Promise<void> {
    return new Promise((resolve) => {
        const contentDiv = document.getElementById('content-div') as HTMLDivElement;
        contentDiv.innerHTML = data;
        resolve(); // Resolve after DOM update
    });
}

