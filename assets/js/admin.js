const BASE_URL = "https://diskvotingsystem.up.railway.app";
const BASE_URL1 = "http://localhost:5000"; //test locally

// --- Admin Login Logic ---
document.addEventListener("DOMContentLoaded", function () {
    const loginSection = document.getElementById("adminLoginSection");
    const dashboardSection = document.getElementById("dashboardSection");
    const loginForm = document.getElementById("adminLoginForm");
    let isLoggedIn = false;

    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const password = document.getElementById("adminPassword").value;
            const loginBtn = document.getElementById("loginBtn");
            const btnText = loginBtn.querySelector(".btn-text");
            const errorMessage = document.getElementById("errorMessage");
            const errorText = document.getElementById("errorText");
            btnText.innerHTML =
                '<i class="fas fa-spinner fa-spin mr-2"></i>Verifying...';
            loginBtn.disabled = true;
            errorMessage.classList.add("hidden");
            try {
                const response = await fetch(`${BASE_URL}/admin/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password }),
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    btnText.innerHTML =
                        '<i class="fas fa-check mr-2"></i>Access Granted';
                    setTimeout(() => {
                        isLoggedIn = true;
                        loginSection.classList.add("hidden");
                        dashboardSection.classList.remove("hidden");
                        initializeDashboard();
                    }, 800);
                } else {
                    errorText.textContent =
                        data.error || "Invalid password. Please try again.";
                    errorMessage.classList.remove("hidden");
                    btnText.textContent = "Access Dashboard";
                    loginBtn.disabled = false;
                    document.getElementById("adminPassword").value = "";
                    document.getElementById("adminPassword").focus();
                }
            } catch (error) {
                console.error("Login error:", error);
                errorText.textContent = "Connection error. Please try again.";
                errorMessage.classList.remove("hidden");
                btnText.textContent = "Access Dashboard";
                loginBtn.disabled = false;
            }
        });
    }

    // --- Dashboard Logic ---
    function initializeDashboard() {
        updateTime();
        initDataTable();
        setInterval(updateTime, 60000);
        fetchTable();
        fetchVotes();
        fetchCandidates();
        fetchProgress();
    }

    // Tab switching
    window.showTab = function (tabName) {
        const tabContents = document.querySelectorAll(".tab-content");
        tabContents.forEach((content) => content.classList.add("hidden"));
        const tabBtns = document.querySelectorAll(".tab-btn");
        tabBtns.forEach((btn) => {
            btn.classList.remove("border-green-500", "text-green-600");
            btn.classList.add("border-transparent", "text-gray-500");
        });
        document.getElementById(tabName + "-tab").classList.remove("hidden");
        const activeTab = document.getElementById("tab-" + tabName);
        if (activeTab) {
            activeTab.classList.remove("border-transparent", "text-gray-500");
            activeTab.classList.add("border-green-500", "text-green-600");
        }
    };

    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
        const dateString = now.toLocaleDateString("en-CA");
        document.getElementById(
            "lastUpdated"
        ).textContent = `${timeString}, ${dateString}`;
    }

    function initDataTable() {
        if (
            $("#votersTable").length &&
            !$.fn.DataTable.isDataTable("#votersTable")
        ) {
            $("#votersTable").DataTable({
                pageLength: 10,
                lengthMenu: [10, 25, 50, 100],
                order: [[0, "asc"]],
                columnDefs: [{ orderable: false, targets: 4 }],
                language: {
                    search: "Search voters:",
                    lengthMenu: "Show _MENU_ entries per page",
                    info: "Showing _START_ to _END_ of _TOTAL_ voters",
                    paginate: {
                        first: "First",
                        last: "Last",
                        next: "Next",
                        previous: "Previous",
                    },
                },
            });
        }
    }

    async function fetchVotes() {
        const response = await fetch(`${BASE_URL}/getStudents`);
        const stud = await response.json();
        document.getElementById("totalVotes").textContent = stud.totalStudents;
        document.getElementById("voted").textContent = stud.totalVoted;
        document.getElementById("unvoted").textContent = stud.totalUnvoted;


        const container = document.getElementById("voterTable");
        if (container) container.innerHTML = "";
    }

    async function fetchCandidates() {
        const response = await fetch(`${BASE_URL}/getCandidates`);
        const { candidates } = await response.json();
        document.getElementById("totalCandidates").textContent =
            "All Candidates (" + candidates.length + ")";

        // Sort candidates by votes for top 4
        const sortedCandidates = [...candidates].sort(
            (a, b) => b.total_votes - a.total_votes
        );
        const top4Candidates = sortedCandidates.slice(0, 4);

        // Render Top 4 Candidates
        const topContainer = document.getElementById("topCandidatesContainer");
        if (topContainer) {
            topContainer.innerHTML = "";
            top4Candidates.forEach((candidate, index) => {
                const rankColors = ["gold", "silver", "#cd7f32", "gray"];
                const rankIcons = [
                    "fas fa-crown",
                    "fas fa-medal",
                    "fas fa-award",
                    "fas fa-star",
                ];
                const card = document.createElement("div");
                card.className =
                    "relative flex flex-col items-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border-2 border-yellow-200 shadow-lg";
                card.innerHTML = `
                            <div class="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                                <span class="text-xs font-bold text-yellow-800">${
                                    index + 1
                                }</span>
                            </div>
                            <div class="text-center mb-2">
                                <i class="${
                                    rankIcons[index]
                                } text-2xl mb-2" style="color: ${
                    rankColors[index]
                }"></i>
                            </div>
                            <img src="../assets/img/placeholder-profile.jpg" alt="Candidate" class="w-16 h-16 rounded-full border-3 border-yellow-300 mb-2">
                            <h4 class="font-semibold text-gray-800 text-center text-sm">${
                                candidate.name
                            }</h4>
                            <p class="text-xs text-gray-600 font-medium">${
                                candidate.total_votes
                            } votes</p>
                        `;
                topContainer.appendChild(card);
            });
        }

        // Render All Candidates
        const container = document.getElementById("candidatesContainer");
        if (container) {
            container.innerHTML = "";
            candidates.forEach((candidate, index) => {
                const card = document.createElement("div");
                card.className =
                    "flex flex-col items-center p-4 bg-green-100 rounded-lg";
                card.innerHTML = `
                            <img src="../assets/img/placeholder-profile.jpg" alt="Candidate" class="w-20 h-20 rounded-full">
                            <div><h4 class="font-semibold text-gray-800">${candidate.name}</h4></div>
                        `;
                container.appendChild(card);
            });
        }
    }

    async function fetchProgress() {
        const response = await fetch(`${BASE_URL}/getCandidates`);
        const { candidates } = await response.json();
        const totalVotes = candidates.reduce(
            (total, candidate) => total + candidate.total_votes,
            0
        );
        const container = document.getElementById("candidateResults");
        if (container) container.innerHTML = "";
        candidates.sort((a, b) => b.total_votes - a.total_votes);
        candidates.forEach((candidate) => {
            const percent = totalVotes
                ? ((candidate.total_votes / totalVotes) * 100).toFixed(1)
                : 0;
            const progress = document.createElement("div");
            progress.className = "p-4 bg-gray-50 rounded-lg";
            progress.innerHTML = `
                        <div class="flex items-center mb-3">
                            <img src="../assets/img/placeholder-profile.jpg" alt="Candidate" class="w-12 h-12 rounded-full mr-4">
                            <div><h3 class="font-semibold text-gray-800">${candidate.name}</h3></div>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-6 mb-2">
                            <div class="bg-green-600 h-6 rounded-full flex items-center justify-end pr-2" style="width: ${percent}%;">
                                <span class="text-xs font-semibold text-white">${candidate.total_votes} votes</span>
                            </div>
                        </div>
                        <p class="text-sm text-gray-600">${percent}% of total votes</p>
                    `;
            container.appendChild(progress);
        });
    }

    async function fetchTable() {
        try {
            const response = await fetch(`${BASE_URL}/getVoters`);
            const { voters } = await response.json();

            // Calculate semester statistics
            const semesterStats = {
                2: { total: 0, voted: 0 },
                4: { total: 0, voted: 0 },
                5: { total: 0, voted: 0 },
            };

            voters.forEach((voter) => {
                const semester = voter.semester || 0;
                if (semesterStats[semester]) {
                    semesterStats[semester].total++;
                    if (voter.voted) {
                        semesterStats[semester].voted++;
                    }
                }
            });

            // Update semester statistics display
            Object.keys(semesterStats).forEach((sem) => {
                const stats = semesterStats[sem];
                const rate =
                    stats.total > 0
                        ? ((stats.voted / stats.total) * 100).toFixed(2)
                        : "0.0";
                document.getElementById(
                    `semester${sem}Rate`
                ).textContent = `${rate}%`;
                console.log(rate); //debug
                document.getElementById(
                    `semester${sem}Details`
                ).textContent = `${stats.voted}/${stats.total} students`;
            });

            // Update DataTable
            const table = $("#votersTable").DataTable();
            table.clear();
            voters.forEach((voter) => {
                const status = voter.voted
                    ? `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Voted</span>`
                    : `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>`;

                const semesterBadge = voter.part
                    ? `<span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Sem ${voter.part}</span>`
                    : `<span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">N/A</span>`;

                table.row.add([
                    voter.id,
                    voter.name || "N/A",
                    semesterBadge,
                    status,
                    " ",
                ]);
            });
            table.draw();
        } catch (error) {
            console.error("Error fetching voter data:", error);
            // Fallback display for semester stats
            ["2", "4", "5"].forEach((sem) => {
                document.getElementById(`semester${sem}Rate`).textContent =
                    "0.0%";
                document.getElementById(`semester${sem}Details`).textContent =
                    "0/0 students";
            });
        }
    }

    // Only run dashboard logic if already logged in (for safety)
    if (
        dashboardSection &&
        !loginSection &&
        !dashboardSection.classList.contains("hidden")
    ) {
        initializeDashboard();
    }
});
