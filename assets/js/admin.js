const BASE_URL = "https://diskvoting.my";
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

        // --- Custom DataTable Filtering ---
        $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
            // Only apply to votersTable
            if (settings.nTable.id !== "votersTable") return true;
            // Semester filter
            var semester = $("#semesterFilter").val();
            var semesterCol = data[2] || "";
            if (semester) {
                if (!semesterCol.includes("Sem " + semester)) return false;
            }
            // Status filter
            var status = $("#statusFilter").val();
            var statusCol = data[3] || "";
            if (status) {
                if (!statusCol.includes(status)) return false;
            }
            return true;
        });
        // Event listeners for filters
        $("#semesterFilter, #statusFilter").on("change", function () {
            $("#votersTable").DataTable().draw();
        });
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
                            <img src="${
                                candidate.candidate_pic
                            }" alt="Candidate" class="w-16 h-16 rounded-full border-3 border-yellow-300 mb-2">
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
                            <img src="${candidate.candidate_pic}" alt="Candidate" class="w-20 h-20 rounded-full">
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
                ? ((candidate.total_votes / totalVotes) * 100).toFixed(3)
                : 0;
            const progress = document.createElement("div");
            progress.className = "p-4 bg-gray-50 rounded-lg";
            progress.innerHTML = `
                        <div class="flex items-center mb-3">
                            <img src="${candidate.candidate_pic}" alt="Candidate" class="w-12 h-12 rounded-full mr-4">
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
            console.log(voters);

            // Calculate semester statistics

            let totalVoted4 = 0;
            let totalVoted5 = 0;
            let totalVoted2 = 0;
            let totalPart4 = 0;
            let totalPart2 = 0;
            let totalPart5 = 0;

            voters.forEach((voter) => {
                if (voter.part == 4) totalPart4++;
                if (voter.part == 5) totalPart5++;
                if (voter.part == 2) totalPart2++;

                if (voter.voted == true && voter.part == 4) totalVoted4++;
                if (voter.voted == true && voter.part == 2) totalVoted2++;
                if (voter.voted == true && voter.part == 5) totalVoted5++;
            });

            console.log("totalpart4", totalPart4);
            console.log("totalpart2", totalPart2);
            console.log("totalpart5", totalPart5);
            console.log("totalvoted4", totalVoted4);
            console.log("totalvoted2", totalVoted2);
            console.log("totalvoted5", totalVoted5);

            const rate2 = (totalVoted2 / totalPart2) * 100;
            const rate4 = (totalVoted4 / totalPart4) * 100;
            const rate5 = (totalVoted5 / totalPart5) * 100;
            console.log(rate4.toFixed(2) + "%");
            console.log(rate2.toFixed(2) + "%");
            console.log(rate5.toFixed(2) + "%");

            document.getElementById("semester2Rate").textContent =
                rate2.toFixed(2) + "%";
            document.getElementById("semester4Rate").textContent =
                rate4.toFixed(2) + "%";
            document.getElementById("semester5Rate").textContent =
                rate5.toFixed(2) + "%";

            document.getElementById("semester4Details").textContent =
                totalVoted4 + "/" + totalPart4;
            document.getElementById("semester2Details").textContent =
                totalVoted2 + "/" + totalPart2;
            document.getElementById("semester5Details").textContent =
                totalVoted5 + "/" + totalPart5;

            // Update DataTable
            const table = $("#votersTable").DataTable();
            table.clear();
            voters.forEach((voter) => {
                const status = voter.voted
                    ? `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Voted</span>`
                    : `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Unvoted</span>`;

                let semesterBadge = "";

                if (voter.part == 2) {
                    semesterBadge = `<span class="px-2 py-1 text-xs font-medium rounded-full bg-pink-100 text-yellow-800">Sem 2</span>`;
                } else if (voter.part == 4) {
                    semesterBadge = `<span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-green-800">Sem 4</span>`;
                } else if (voter.part == 5) {
                    semesterBadge = `<span class="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">Sem 5</span>`;
                } else {
                    semesterBadge = `<span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">N/A</span>`;
                }

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

    // Print voters table function
    window.printVotersTable = function () {
        const table = $("#votersTable").DataTable();
        const currentData = table.rows({ search: "applied" }).data();
        const currentOrder = table.order();
        const currentSearch = table.search();
        const semesterFilter = $("#semesterFilter").val();
        const statusFilter = $("#statusFilter").val();

        // Create print window content
        let printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>DISK Voting System - Voters Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .header h1 { color: #059669; margin: 0; }
          .header p { color: #666; margin: 5px 0; }
          .filters { margin-bottom: 20px; padding: 10px; background-color: #f9f9f9; border-radius: 5px; }
          .filters h3 { margin: 0 0 10px 0; color: #333; }
          .filter-item { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .status-voted { background-color: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
          .status-unvoted { background-color: #fef2f2; color: #991b1b; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
          .semester-badge { padding: 2px 6px; border-radius: 3px; font-size: 12px; font-weight: 500; }
          .sem-2 { background-color: #fdf2f8; color: #9d174d; }
          .sem-4 { background-color: #dbeafe; color: #1e40af; }
          .sem-5 { background-color: #f3e8ff; color: #7c3aed; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DISK Voting System</h1>
          <p>Voter Information Report</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="filters">
          <h3>Current Filters Applied:</h3>
          <div class="filter-item"><strong>Semester:</strong> ${
              semesterFilter ? `Semester ${semesterFilter}` : "All Semesters"
          }</div>
          <div class="filter-item"><strong>Status:</strong> ${
              statusFilter || "All Statuses"
          }</div>
          <div class="filter-item"><strong>Search:</strong> ${
              currentSearch || "None"
          }</div>
          <div class="filter-item"><strong>Total Records:</strong> ${
              currentData.length
          }</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Semester</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
    `;

        // Add table rows
        currentData.each(function (rowData) {
            const studentId = rowData[0];
            const name = rowData[1];
            const semesterHtml = rowData[2];
            const statusHtml = rowData[3];

            // Extract semester text and class
            let semesterText = "N/A";
            let semesterClass = "";
            if (semesterHtml.includes("Sem 2")) {
                semesterText = "Semester 2";
                semesterClass = "sem-2";
            } else if (semesterHtml.includes("Sem 4")) {
                semesterText = "Semester 4";
                semesterClass = "sem-4";
            } else if (semesterHtml.includes("Sem 5")) {
                semesterText = "Semester 5";
                semesterClass = "sem-5";
            }

            // Extract status text and class
            let statusText = "Unknown";
            let statusClass = "";
            if (statusHtml.includes("Voted")) {
                statusText = "Voted";
                statusClass = "status-voted";
            } else if (statusHtml.includes("Unvoted")) {
                statusText = "Unvoted";
                statusClass = "status-unvoted";
            }

            printContent += `
        <tr>
          <td>${studentId}</td>
          <td>${name}</td>
          <td><span class="semester-badge ${semesterClass}">${semesterText}</span></td>
          <td><span class="${statusClass}">${statusText}</span></td>
        </tr>
      `;
        });

        printContent += `
          </tbody>
        </table>
      </body>
      </html>
    `;

        // Open print window
        const printWindow = window.open("", "_blank");
        printWindow.document.write(printContent);
        printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = function () {
            printWindow.print();
            printWindow.close();
        };
    };

    initializeDashboard();

    // Only run dashboard logic if already logged in (for safety)
    if (
        dashboardSection &&
        !loginSection &&
        !dashboardSection.classList.contains("hidden")
    ) {
        initializeDashboard();
    }
});
