const BASE_URL = "https://diskvotingsystem-production.up.railway.app";
const BASE_URL1 = "http://localhost:5000"; //test locally

function showTab(tabName) {
  // Hide all tab contents
  const tabContents = document.querySelectorAll(".tab-content");
  tabContents.forEach((content) => content.classList.add("hidden"));

  // Remove active state from all tabs
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach((btn) => {
    btn.classList.remove("border-green-500", "text-green-600");
    btn.classList.add("border-transparent", "text-gray-500");
  });

  // Show selected tab content
  document.getElementById(tabName + "-tab").classList.remove("hidden");

  // Add active state to selected tab
  const activeTab = document.getElementById("tab-" + tabName);
  activeTab.classList.remove("border-transparent", "text-gray-500");
  activeTab.classList.add("border-green-500", "text-green-600");
}

// Update last updated time
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

// Initialize DataTable
function initDataTable() {
  $("#votersTable").DataTable({
    pageLength: 10,
    lengthMenu: [10, 25, 50, 100],
    order: [[0, "asc"]],
    columnDefs: [{ orderable: false, targets: 2 }],
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

// Initialize everything when page loads
document.addEventListener("DOMContentLoaded", function () {
  updateTime();
  initDataTable();
  setInterval(updateTime, 60000);
});

async function fetchVotes() {
  const response = await fetch(`${BASE_URL}/getStudents`);
  const stud = await response.json();
  console.log(stud);

  document.getElementById("totalVotes").textContent = stud.totalStudents;
  document.getElementById("voted").textContent = stud.totalVoted;
  document.getElementById("unvoted").textContent = stud.totalUnvoted;

    const container=document.getElementById("voterTable");
    container.innerHTML = "";

}

async function fetchCandidates() {
  const response = await fetch(`${BASE_URL}/getCandidates`);
  const {candidates} = await response.json();
  console.log(candidates.length);

  document.getElementById("totalCandidates").textContent = "Total Candidates: " + candidates.length;

  const container = document.getElementById("candidatesContainer");
  container.innerHTML = "";

        candidates.forEach((candidate, index) => {
          
            const card = document.createElement("div");
            card.className = "flex flex-col items-center p-4 bg-green-100 rounded-lg";
            card.innerHTML= `
                
                        <img src="../assets/img/placeholder-profile.jpg" alt="Candidate 1" class="w-20 h-20 rounded-full">
                        <div>
                            <h4 class="font-semibold text-gray-800">${candidate.name}</h4>
                        </div>
                   
            `;
            container.appendChild(card);
        });

}

async function fetchProgress() {
    
     const response = await fetch("https://diskvotingsystem-production.up.railway.app/getCandidates");
        const { candidates } = await response.json();
        console.log(candidates);

    const totalVotes = candidates.reduce((total, candidate) => total + candidate.total_votes, 0);
    console.log(totalVotes);

    const container = document.getElementById("candidateResults");
    container.innerHTML = "";

     candidates.sort((a, b) => b.total_votes - a.total_votes);

    candidates.forEach((candidate) => {
        const percent = (candidate.total_votes / totalVotes * 100).toFixed(1);

        const progress = document.createElement("div");
        progress.className = "p-4 bg-gray-50 rounded-lg";
        progress.innerHTML = `
        
                        <div class="flex items-center mb-3">
                            <img src="../assets/img/placeholder-profile.jpg" alt="Candidate 1" class="w-12 h-12 rounded-full mr-4">
                            <div>
                                <h3 class="font-semibold text-gray-800">${candidate.name}</h3>
                            </div>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-6 mb-2">
                            <div class="bg-green-600 h-6 rounded-full flex items-center justify-end pr-2" style="width: ${percent}%;">
                                <span class="text-xs font-semibold text-white">${candidate.total_votes} votes</span>
                            </div>
                        </div>
                        <p class="text-sm text-gray-600">${percent}%% of total votes</p>
                  

        `;
        container.appendChild(progress);
        
        //console.log(candidate.name, percent)

      });
    
}

async function fetchTable() {
  const response = await fetch(`${BASE_URL}/getVoters`);
  const { voters } = await response.json();
  console.log(voters);

  const table = $('#votersTable').DataTable();
  table.clear();

  voters.forEach((voter) => {
    const status = voter.voted
      ? `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Voted</span>`
      : `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>`;

    table.row.add([voter.id, status, " "]); // match table headers
  });

  table.draw();
}

window.addEventListener("DOMContentLoaded", () => {
  $('#votersTable').DataTable();
  fetchTable();
  fetchVotes();
  fetchCandidates();
  fetchProgress();
});
