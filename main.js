function showTab(tabName) {
    const tabContainer = document.querySelector(".tab-container");
    tabContainer.style.transition = "none";

    window.scrollTo({
        top: 0,
        behavior: "instant"
    });

    tabContainer.classList.remove("scrolled");

    const tabContents = document.querySelectorAll(".tab-content");
    tabContents.forEach((tab) => {
        tab.classList.remove("active");
    });

    const tabs = document.querySelectorAll(".tab");
    tabs.forEach((tab) => {
        tab.classList.remove("active");
    });

    document.getElementById(tabName).classList.add("active");
    event.target.classList.add("active");

    const activeContent = document.getElementById(tabName);
    activeContent.style.animation = "none";

    setTimeout(() => {
        tabContainer.style.transition = "";
        activeContent.style.animation = "fadeIn 0.5s ease-out";
    }, 50);
}

function createPDFEmbed(pdfPath, pdfId, driveUrl) {
    const isPlaceholder = driveUrl.includes('/yo/preview');

    const supportsPDF = (function() {
        const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth <= 768;

        const userAgent = navigator.userAgent.toLowerCase();
        const isMobileBrowser = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(userAgent);

        let hasPDFSupport;
        try {
            hasPDFSupport = navigator.pdfViewerEnabled || (navigator.plugins && Array.from(navigator.plugins).some((plugin) => plugin.name.toLowerCase().includes("pdf")));
        } catch (e) {
            hasPDFSupport = false;
        }

        return !isTouchDevice && !isSmallScreen && !isMobileBrowser && hasPDFSupport;
    })();

    if (isPlaceholder) {
        return `
                    <div class="pdf-placeholder" id="placeholder-${pdfId}" style="opacity: 0.5; cursor: not-allowed;">
                        <div class="load-button" style="pointer-events: none;">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style="opacity: 0.5;">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            <span style="opacity: 0.5;">Not Available Yet</span>
                        </div>
                    </div>
            `;
    }

    if (supportsPDF) {
        // Native PDF embed
        return `
                    <div style="position: relative; width: 100%; height: 100%;">
                        <object data="${pdfPath}#view=Fit" type="application/pdf"
                                style="width: 160%; height: 100%; margin-left: -30%; border: none;">
                            <div class="pdf-placeholder" id="placeholder-${pdfId}">
                                <div class="load-button" onclick="loadPDF('placeholder-${pdfId}', '${driveUrl}')">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                    <span>Error</span>
                                </div>
                            </div>
                        </object>
                        <button onclick="window.open('${pdfPath}', '_blank')"
                                style="position: absolute;
                                    top: 50%;
                                    right: 8px;
                                    transform: translateY(-50%);
                                    background: rgba(0, 0, 0, 0.7);
                                    border: 1px solid rgba(255, 255, 255, 0.3);
                                    border-radius: 50%;
                                    width: 32px;
                                    height: 32px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    color: white;
                                    cursor: pointer;
                                    transition: all 0.3s ease;
                                    backdrop-filter: blur(5px);
                                    z-index: 10;"
                                onmouseover="this.style.background='rgba(255, 107, 107, 0.9)'; this.style.transform='translateY(-50%) scale(1.1)'"
                                onmouseout="this.style.background='rgba(0, 0, 0, 0.7)'; this.style.transform='translateY(-50%) scale(1)'"
                                title="Open in new tab">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                            </svg>
                        </button>
                    </div>
            `;
    } else {
        // Mobile or no PDF support
        return `
                    <div class="pdf-placeholder" id="placeholder-${pdfId}">
                        <div class="load-button" onclick="loadPDF('placeholder-${pdfId}', '${driveUrl}')">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                            <span>Load PDF</span>
                        </div>
                    </div>
            `;
    }
}

function loadPDF(placeholderId, pdfUrl) {
    const versionedUrl = `${pdfUrl}${pdfUrl.includes("?") ? "&" : "?"}v=${SITE_VERSION}`;
    const placeholder = document.getElementById(placeholderId);
    placeholder.innerHTML = `<iframe src="${versionedUrl}" allow="autoplay"></iframe>`;
    placeholder.classList.remove("pdf-placeholder");
}

function loadAllPDFs() {
    const unloadedPlaceholders = document.querySelectorAll('.pdf-placeholder .load-button[onclick*="loadPDF"]');
    if (unloadedPlaceholders.length === 0) return;

    const button = document.getElementById("loadAllBtn");
    if (!button) return;

    const container = document.querySelector(".load-all-container");

    button.disabled = true;
    button.classList.add("loading");
    button.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg> Loading...';

    // PDF URLs array for mobile
    const pdfData = [
        { id: "placeholder-1", url: "https://drive.google.com/file/d/1o1m-AOBmkYQnOCbGpgNqfuhypJw0LyFb/preview" },
        { id: "placeholder-2", url: "https://drive.google.com/file/d/1ZMN2h90f8dtrsGeeJaFlMQ2ilexzjGNZ/preview" },
        { id: "placeholder-3", url: "https://drive.google.com/file/d/1DGH137BYqBw8nk0Z7sSyo8o43ONz81Wf/preview" },
        { id: "placeholder-4", url: "https://drive.google.com/file/d/11NCJhE-fjhxVzkF76g8vK9cK9jElHMLU/preview" },
        { id: "placeholder-5", url: "https://drive.google.com/file/d/1jwst7A5x5-XdCp2uRMSV1Bzkcz3nyyZ5/preview" },
        { id: "placeholder-6", url: "https://drive.google.com/file/d/1RG7C-0-w66xkNGV-BBma9wKuDrTzuiKS/preview" },
        { id: "placeholder-7", url: "https://drive.google.com/file/d/1srYxhyx1WsHqzaXHAFr041A4qgVaqKxn/preview" },
        { id: "placeholder-8", url: "https://drive.google.com/file/d/1E_rMKM3q0fsiRZSzUuJVHyC1WSlKXEdr/preview" },
        { id: "placeholder-9", url: "https://drive.google.com/file/d/19viS9LFusX5zEy9aQWb2VPpnx7WwO5f5/preview" },
        { id: "placeholder-10", url: "https://drive.google.com/file/d/14SoE08itCyfZoR01u17wuy5ropLGx4r4/preview" },
        { id: "placeholder-11", url: "https://drive.google.com/file/d/1VicvvI0x5VAL8YXFdw8Hw2lQxrdKKQ9m/preview" },
        { id: "placeholder-12", url: "https://drive.google.com/file/d/1Rji2KO-IFmOMCGX0WXpyeOt3awqvIsGR/preview" },
        { id: "placeholder-13", url: "https://drive.google.com/file/d/18CFV8ayme9D-Y0Dzv39N1T2635MDXdE-/preview" },
        { id: "placeholder-14", url: "https://drive.google.com/file/d/1MnJwXPs_R6H_UXeOQtGWXPSOWeZcsOCk/preview" }
    ];

    // PDF loading delay
    pdfData.forEach((pdf, index) => {
        setTimeout(() => {
            loadPDF(pdf.id, pdf.url);

            if (index === pdfData.length - 1) {
                button.classList.remove("loading");
                setTimeout(() => {
                    container.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
                    container.style.opacity = "0";
                    container.style.transform = "translateY(-20px)";

                    setTimeout(() => {
                        container.style.display = "none";
                    }, 500);
                }, 500);
            }
        }, index * 200);
    });
}

function initializeStaggeredAnimation() {
    const coverStories = document.querySelectorAll(".cover-story");
    coverStories.forEach((story, index) => {
        story.style.setProperty("--item-index", index);
        story.style.opacity = "0";
        story.style.transform = "translateY(30px) scale(0.95)";

        setTimeout(() => {
            story.style.animation = `slideInUp 0.6s ease-out forwards`;
            story.style.animationDelay = `${index * 0.1}s`;
        }, 100);
    });
}

function updateLoadAllButton() {
    const placeholders = document.querySelectorAll('.pdf-placeholder .load-button[onclick]');
    const drivePlaceholders = Array.from(placeholders).filter(el => {
        const onclick = el.getAttribute("onclick");
        return onclick && onclick.includes("drive.google.com") && el.offsetParent !== null;
    });

    const loadAllContainer = document.getElementById("mobileLoadAllContainer");
    if (!loadAllContainer) return;

    loadAllContainer.style.display = drivePlaceholders.length > 0 ? "block" : "none";
}

// Call the function when the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    const pdfs = [
        { id: "pdf-1", path: "./Colored Cover Stories (with notes)/01.pdf", driveUrl: "https://drive.google.com/file/d/1o1m-AOBmkYQnOCbGpgNqfuhypJw0LyFb/preview" },
        { id: "pdf-2", path: "./Colored Cover Stories (with notes)/02.pdf", driveUrl: "https://drive.google.com/file/d/1ZMN2h90f8dtrsGeeJaFlMQ2ilexzjGNZ/preview" },
        { id: "pdf-3", path: "./Colored Cover Stories (with notes)/03.pdf", driveUrl: "https://drive.google.com/file/d/1DGH137BYqBw8nk0Z7sSyo8o43ONz81Wf/preview" },
        { id: "pdf-4", path: "./Colored Cover Stories (with notes)/04.pdf", driveUrl: "https://drive.google.com/file/d/11NCJhE-fjhxVzkF76g8vK9cK9jElHMLU/preview" },
        { id: "pdf-5", path: "./Colored Cover Stories (with notes)/05.pdf", driveUrl: "https://drive.google.com/file/d/1jwst7A5x5-XdCp2uRMSV1Bzkcz3nyyZ5/preview" },
        { id: "pdf-6", path: "./Colored Cover Stories (with notes)/06.pdf", driveUrl: "https://drive.google.com/file/d/1RG7C-0-w66xkNGV-BBma9wKuDrTzuiKS/preview" },
        { id: "pdf-7", path: "./Colored Cover Stories (with notes)/07.pdf", driveUrl: "https://drive.google.com/file/d/1srYxhyx1WsHqzaXHAFr041A4qgVaqKxn/preview" },
        { id: "pdf-8", path: "./Colored Cover Stories (with notes)/08.pdf", driveUrl: "https://drive.google.com/file/d/1E_rMKM3q0fsiRZSzUuJVHyC1WSlKXEdr/preview" },
        { id: "pdf-9", path: "./Colored Cover Stories (with notes)/09_0.pdf", driveUrl: "https://drive.google.com/file/d/19viS9LFusX5zEy9aQWb2VPpnx7WwO5f5/preview" },
        { id: "pdf-10", path: "./Colored Cover Stories (with notes)/09.pdf", driveUrl: "https://drive.google.com/file/d/14SoE08itCyfZoR01u17wuy5ropLGx4r4/preview" },
        { id: "pdf-11", path: "./Colored Cover Stories (with notes)/10_0.pdf", driveUrl: "https://drive.google.com/file/d/1VicvvI0x5VAL8YXFdw8Hw2lQxrdKKQ9m/preview" },
        { id: "pdf-12", path: "./Colored Cover Stories (with notes)/10.pdf", driveUrl: "https://drive.google.com/file/d/1Rji2KO-IFmOMCGX0WXpyeOt3awqvIsGR/preview" },
        { id: "pdf-13", path: "./Colored Cover Stories (with notes)/11-18.pdf", driveUrl: "https://drive.google.com/file/d/18CFV8ayme9D-Y0Dzv39N1T2635MDXdE-/preview" },
        { id: "pdf-14", path: "./Colored Cover Stories (with notes)/19 (without last page).pdf", driveUrl: "https://drive.google.com/file/d/1MnJwXPs_R6H_UXeOQtGWXPSOWeZcsOCk/preview" },
        { id: "pdf-15", path: "./Colored Cover Stories/20.pdf", driveUrl: "https://drive.google.com/file/d/yo/preview" },
        { id: "pdf-16", path: "./Colored Cover Stories/21.pdf", driveUrl: "https://drive.google.com/file/d/yo/preview" },
        { id: "pdf-17", path: "./Colored Cover Stories/22.pdf", driveUrl: "https://drive.google.com/file/d/yo/preview" },
        { id: "pdf-18", path: "./Colored Cover Stories/23.pdf", driveUrl: "https://drive.google.com/file/d/yo/preview" },
        { id: "pdf-19", path: "./Colored Cover Stories/24.pdf", driveUrl: "https://drive.google.com/file/d/yo/preview" },
        { id: "pdf-20", path: "./Colored Cover Stories/25.pdf", driveUrl: "https://drive.google.com/file/d/yo/preview" },
        { id: "pdf-21", path: "./Colored Cover Stories/26.pdf", driveUrl: "https://drive.google.com/file/d/yo/preview" }
    ];

    pdfs.forEach((pdf, index) => {
        const container = document.getElementById(pdf.id);
        if (container) {
            const pdfNumber = pdf.id.replace("pdf-", "");
            setTimeout(() => {
                container.innerHTML = createPDFEmbed(pdf.path, pdfNumber, pdf.driveUrl);
            }, index * 200);
        }
    });

    // animation function
    initializeStaggeredAnimation();

    // Run after PDFs have been scheduled for creation
    setTimeout(updateLoadAllButton, pdfs.length * 220);
});

function toggleSpoiler(element) {
    element.classList.toggle("revealed");
}

function toggleCollapsible(sectionId) {
    const content = document.getElementById(sectionId + '-content');
    const toggle = document.getElementById(sectionId + '-toggle');

    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        toggle.innerHTML = '+';
        toggle.style.transform = 'rotate(0deg)';
    } else {
        content.classList.add('expanded');
        toggle.innerHTML = '−';
        toggle.style.transform = 'rotate(180deg)';
    }
}

const scrollBtn = document.getElementById("scrollToggle");
const scrollIcon = document.getElementById("scrollIcon");

function updateScrollButton() {
    const scrolled = window.scrollY;
    const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;

    if (scrolled > 300) {
        if (nearBottom) {
            scrollIcon.innerHTML = '<path d="m18 15-6-6-6 6"/>';
            scrollBtn.onclick = () => {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            };
        } else {
            scrollIcon.innerHTML = '<path d="m6 9 6 6 6-6"/>';
            scrollBtn.onclick = () => {
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: "smooth"
                });
            };
        }
        scrollBtn.style.display = "block";
    } else {
        scrollBtn.style.display = "none";
    }
}
window.addEventListener("scroll", updateScrollButton);
updateScrollButton();

let isScrolled = false;

function updateTabContainer() {
    const tabContainer = document.querySelector(".tab-container");
    const scrollY = window.scrollY;
    const startThreshold = 100;
    const endThreshold = 400;

    if (scrollY <= startThreshold) {
        tabContainer.classList.remove("scrolled");
        isScrolled = false;
    } else if (scrollY >= endThreshold) {
        tabContainer.classList.add("scrolled");
        isScrolled = true;
    }
}

window.addEventListener("scroll", updateTabContainer);

let scrollTimeout;
window.addEventListener("scroll", function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateTabContainer, 10);
});

function openLightbox(imageSrc) {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    lightboxImg.src = imageSrc;
    const filename = imageSrc.split("/").pop();
    lightboxImg.alt = filename
        .replace(/\.(webp|jpg|jpeg|png|gif)$/i, "")
        .replace(/^\d+\s*-\s*/, "")
        .replace(/[-_]/g, " ")
        .trim();
    lightbox.style.display = "block";
}

function closeLightbox() {
    document.getElementById("lightbox").style.display = "none";
}

document.addEventListener("click", function(e) {
    if (e.target.id === "lightbox" || e.target.id === "lightbox-img") {
        closeLightbox();
    }
});
