const form = document.getElementById("urlForm");
const urlInput = document.getElementById("urlInput");
const result = document.getElementById("result");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const url = urlInput.value.trim();

    if (!url) {
        result.textContent = "Please enter a URL";
        return;
    }

    try {
        const response = await fetch("/api/shorten", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: url
            })
        });

        const data = await response.json();

        console.log("Server response:", data);

        if (data.success) {
    result.innerHTML = `
        <p>Short URL:</p>

        <a href="${data.shortUrl}" target="_blank">
            ${data.shortUrl}
        </a>

        <br><br>

        <button id="copyButton">Copy URL</button>
    `;

    const copyButton = document.getElementById("copyButton");

    copyButton.addEventListener("click", async () => {
        await navigator.clipboard.writeText(data.shortUrl);

        copyButton.textContent = "Copied!";

        setTimeout(() => {
            copyButton.textContent = "Copy URL";
        }, 2000);
    });
} else {
            result.textContent = data.message || "Something went wrong";
        }

    } catch (error) {
        console.error("Error:", error);
        result.textContent = "Something went wrong. Please try again.";
    }
});
// Load URL history
async function loadHistory() {
    const historyContainer = document.getElementById("history");

    try {
        const response = await fetch("/api/history");
        const data = await response.json();

        if (!data.success) {
            historyContainer.textContent = "Failed to load URL history.";
            return;
        }

        if (data.urls.length === 0) {
            historyContainer.textContent = "No URLs shortened yet.";
            return;
        }

        historyContainer.innerHTML = "";

        data.urls.forEach((item) => {
            const shortUrl = `${window.location.origin}/${item.short_code}`;

            const historyItem = document.createElement("div");
            historyItem.className = "history-item";

         historyItem.innerHTML = `
    <div class="history-content">

        <p>
            <strong>Original URL:</strong>
            ${item.original_url}
        </p>

        <p>
            <strong>Short URL:</strong>
            <a href="${shortUrl}" target="_blank">
                ${shortUrl}
            </a>
        </p>

    </div>

    <div class="history-actions">

        <button class="copy-button" data-url="${shortUrl}">
            Copy
        </button>

        <button class="delete-button" onclick="deleteUrl('${item.short_code}')">
            Delete
        </button>

    </div>

    <div class="created-at">
        Created: ${formatDate(item.created_at)}
    </div>
`;

            historyContainer.appendChild(historyItem);
            const copyButton = historyItem.querySelector(".copy-button");

copyButton.addEventListener("click", async () => {

    try {
        await navigator.clipboard.writeText(shortUrl);

        copyButton.textContent = "Copied!";

        setTimeout(() => {
            copyButton.textContent = "Copy";
        }, 1500);

    } catch (error) {
        console.error("Copy failed:", error);
        copyButton.textContent = "Failed";
    }
});
        });

    } catch (error) {
        console.error("History error:", error);
        historyContainer.textContent = "Failed to load URL history.";
    }
}

function formatDate(dateString) {
    const date = new Date(dateString.replace(" ", "T") + "Z");

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}
// Load history when page opens
loadHistory();
// Show history section
const historyButton = document.getElementById("historyButton");
const backButton = document.getElementById("backButton");

const shortenerSection = document.getElementById("shortenerSection");
const historySection = document.getElementById("historySection");

historyButton.addEventListener("click", () => {

    shortenerSection.style.display = "none";
    historySection.style.display = "block";

    loadHistory();
});
async function deleteUrl(shortCode) {
    const confirmDelete = confirm("Are you sure you want to delete this URL?");

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`/api/${shortCode}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (data.success) {
            alert("URL deleted successfully!");
            loadHistory();
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error(error);
        alert("Something went wrong.");
    }
}

// Go back to URL shortener
backButton.addEventListener("click", () => {

    historySection.style.display = "none";
    shortenerSection.style.display = "block";
});