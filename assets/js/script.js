const BASE_URL = "https://diskvoting.my";
const BASE_URL1 = "http://localhost:5000"; //test locally

// document.getElementById("studentIdSection").classList.add("hidden");
// document
// .getElementById("candidatesSection")
// .classList.remove("hidden");
// document.getElementById(
// "instruction-text"
// ).textContent = `Welcome, Student ID: ${studentId}. Please select your preferred candidates.`;
// submitBtn.disabled = false;

// Global variables
let selectedCandidates = new Map(); // Map to store candidate ID -> name
let currentStudentId = "";

// Student ID submit
document
    .getElementById("studentForm")
    .addEventListener("submit", async function (e) {
        e.preventDefault();

        const studentId = document.getElementById("studentId").value.trim();
        const submitBtn = document.getElementById("submitBtn");
        const btnText = submitBtn.querySelector(".btn-text");

        // Show loading state
        btnText.innerHTML = '<span class="spinner mr-2"></span>Verifying...';
        submitBtn.disabled = true;

        //console.log("id", studentId);

        try {
            const response = await fetch(`${BASE_URL}/check`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ studentId }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`); 
            }

            const data = await response.json();

            //console.log("StudentData", data);
            if (studentId !== "") {
                // Simulate verification
                setTimeout(() => {
                    currentStudentId = studentId;

                    // Hide student ID section
                    document
                        .getElementById("studentIdSection")
                        .classList.add("hidden");

                    // Show candidates section
                    document
                        .getElementById("candidatesSection")
                        .classList.remove("hidden");

                    // Update instruction text
                    document.getElementById(
                        "instruction-text"
                    ).textContent = `Welcome, ${studentId}. Please select your preferred candidates.`;

                    // Reset button
                    btnText.textContent = "Continue to Vote";
                    submitBtn.disabled = false;
                }, 1000);
            }
        } catch (error) {
            console.error("Error checking student ID:", error);
            showAlert(
                "Student ID is invalid or you have already voted.",
                "warning"
            );
            btnText.textContent = "Continue to Vote";
            submitBtn.disabled = false;
        }
    });

// Cancel Vote Function
function cancelVote() {
    // Clear all selections
    selectedCandidates.clear();

    document.querySelectorAll(".candidate-selector").forEach((selector) => {
        const radio = selector.querySelector(".custom-radio");
        const card = selector.closest(".candidate-card");
        radio.classList.remove("checked");
        selector.classList.remove("selected");
        card.classList.remove("selected");
    });

    // Update counter
    document.getElementById("voteCount").textContent = "0";

    // Hide confirmation section and action bar
    document.getElementById("actionBar").classList.add("hidden");
}

// Submit Vote Function (before confirmation)
function submitVote() {
    if (selectedCandidates.size < 2) {
        showAlert("Please select two candidates before submitting.", "warning");
        return;
    }

    // Display the selected candidates in the modal
    const confirmationCandidatesList = document.getElementById(
        "confirmationCandidatesList"
    );
    confirmationCandidatesList.innerHTML = "";
    selectedCandidates.forEach((name) => {
        const candidateItem = document.createElement("div");
        candidateItem.className =
            "flex items-center p-3 bg-green-50 rounded-lg border border-green-200";
        candidateItem.innerHTML = `
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <i class="fas fa-check text-white text-sm"></i>
            </div>
            <span class="font-semibold text-green-800">${name}</span>
        `;
        confirmationCandidatesList.appendChild(candidateItem);
    });

    // Show the confirmation modal
    const modal = document.getElementById("confirmationModal");
    modal.classList.add("show");
    modal.classList.remove("opacity-0", "invisible");
}

// Close modal function
function closeConfirmationModal() {
    const modal = document.getElementById("confirmationModal");
    modal.classList.remove("show");
    modal.classList.add("opacity-0", "invisible");
}

// Submit vote after confirm
async function confirmAndSubmitVote() {
    closeConfirmationModal();

    const studentId = document.getElementById("studentId").value.trim();

    let candidates = Array.from(selectedCandidates.values());

    const submitBtn = document.getElementById("submitVoteBtn");
    const originalContent = submitBtn.innerHTML;

    // Show loading state
    submitBtn.innerHTML = '<span class="spinner mr-2"></span>Submitting...';
    submitBtn.disabled = true;

    // Log vote data
    console.log("Vote submitted:", {
        studentId: currentStudentId,
        candidates: Array.from(selectedCandidates.entries()),
    });

    const votes = Array.from(selectedCandidates.keys());
    //console.log("VOTES", votes);

    try {
        const response = await fetch(`${BASE_URL}/addVote`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ votes, studentId }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        //console.log("Vote submission response:", data);

        setTimeout(() => {
            // Show success modal
            document.getElementById("successModal").classList.add("show");
            // Reset button
            submitBtn.innerHTML = originalContent;
            submitBtn.disabled = false;
        }, 1500);

    } catch (error) {
        console.error("Error submitting vote:", error);
        showAlert("Error submitting vote. Please try again.", "error");
        // Reset button
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

function resetVoting() {
    // Reset all states
    selectedCandidates.clear();
    currentStudentId = "";

    // Hide success modal
    document.getElementById("successModal").classList.remove("show");

    // Hide action bar
    document.getElementById("actionBar").classList.add("hidden");

    // Hide candidates section
    document.getElementById("candidatesSection").classList.add("hidden");

    // Show student ID section
    document.getElementById("studentIdSection").classList.remove("hidden");

    // Reset form
    document.getElementById("studentForm").reset();

    // Reset instruction text
    document.getElementById("instruction-text").textContent =
        "Please enter your student ID to begin voting";

    // Clear selections
    document.querySelectorAll(".candidate-selector").forEach((selector) => {
        const radio = selector.querySelector(".custom-radio");
        const card = selector.closest(".candidate-card");

        radio.classList.remove("checked");
        selector.classList.remove("selected");
        card.classList.remove("selected");
    });

    // Reset vote counter
    document.getElementById("voteCount").textContent = "0";
}

function showAlert(message, type) {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type} alert-dismissible fade show custom-alert custom-alert-visible`;
    alertDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle mr-2"></i>
        ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 5000);
}

async function addVote() {
    
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    console.log("id", id);
    const selected = Array.from(
        document.querySelectorAll('input[name="vote"]:checked')
    );

    if (selected.length !== 2) {
        alert("You must select exactly 2 candidates.");
        return;
    }

    const voteValues = selected.map((box) => box.value);
    // console.log("Voted for:", voteValues);
    // console.log("id", id);

    try {
        const response = await fetch(`${BASE_URL}/addVote`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ votes: voteValues, id }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        //console.log("Vote submission response:", data);
        
        alert("Votes successfully recorded.");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error submitting vote:", error);
        alert("Error submitting vote. Please try again.");
    }
}

async function loadCandidate() {
    try {
        const response = await fetch(`${BASE_URL}/getCandidates`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const { candidates } = await response.json();
        //console.log(candidates);

        const container = document.getElementById("loadCandidates");
        container.innerHTML = "";

        if (!candidates || candidates.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <i class="fas fa-exclamation-triangle text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600 text-lg">No candidates available at the moment.</p>
                    <p class="text-gray-500 text-sm">Please check back later.</p>
                </div>
            `;
            return;
        }

        candidates.forEach((candidate, index) => {
            // user 3 image only right now
            //const imageIndex = (index % 3) + 1; // because when 3 % 3, it will become 0 and then we +1, since the candidates got 20
            console.log(candidate.candidates_vid);
           
            const imageSrc = `${candidate.candidate_poster}`;
            const card = document.createElement("div");
            card.className =
                "candidate-card bg-green-50 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl border-3 border-transparent mb-6";
            card.innerHTML = `
                <div class="w-full aspect-[9/16] bg-gray-200 flex items-center justify-center overflow-hidden">
                <img
                    src="${imageSrc}"
                    class="object-cover w-full h-full"
                    alt="Candidate ${index + 1}"
                    onerror="this.src='../assets/img/placeholder-profile.jpg'"
                    loading="lazy"
                />
                </div>
                <div class="p-5 md:p-6">
                <div class="rounded-xl overflow-hidden mb-4 bg-gray-200">
                    <iframe
                    class="w-full h-48 md:h-56 border-0"
                   src="https://www.youtube.com/embed/${candidate.candidates_vid}"
                    title="Campaign Video"
                    loading="lazy"
                    allowfullscreen
                    ></iframe>
                </div>
                <div
                    class="candidate-selector flex items-center gap-4 p-4 bg-gray-300 rounded-xl cursor-pointer my-4 transition-all duration-300"
                    data-candidate="${candidate.id}"
                    data-name="${candidate.name}"
                > 
                    <div class="custom-radio w-6 h-6 border-3 border-primary-400 rounded-full flex-shrink-0 relative"></div>
                    <h3 class="candidate-name text-sm md:text-xl font-bold m-0">Vote for ${
                        candidate.name
                    }</h3>
                </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Attach event listeners to the dynamically added selectors
        document.querySelectorAll(".candidate-selector").forEach((selector) => {
            selector.addEventListener("click", function () {
                const candidateId = this.dataset.candidate;
                const candidateName = this.dataset.name;
                const radio = this.querySelector(".custom-radio");
                const card = this.closest(".candidate-card");

                if (selectedCandidates.has(candidateId)) {
                    // Deselect
                    selectedCandidates.delete(candidateId);
                    radio.classList.remove("checked");
                    this.classList.remove("selected");
                    card.classList.remove("selected");
                } else {
                    // Limit to 2 selections
                    if (selectedCandidates.size >= 2) {
                        showAlert(
                            "You can only select up to 2 candidates. Please deselect one first.",
                            "warning"
                        );
                        return;
                    }

                    // Select
                    selectedCandidates.set(candidateId, candidateName);
                    radio.classList.add("checked");
                    this.classList.add("selected");
                    card.classList.add("selected");
                }

                // Update vote count
                document.getElementById("voteCount").textContent =
                    selectedCandidates.size;

                // Show or hide action bar based on selection
                const actionBar = document.getElementById("actionBar");
                if (selectedCandidates.size > 0) {
                    actionBar.classList.remove("hidden");
                } else {
                    actionBar.classList.add("hidden");
                }
            });
        });
    } catch (error) {
        console.error("Error loading candidates:", error);
        
        const container = document.getElementById("loadCandidates");
        container.innerHTML = `
            <div class="col-span-full text-center py-8">
                <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
                <p class="text-red-600 text-lg font-semibold mb-2">Failed to load candidates</p>
                <p class="text-gray-600 text-sm mb-4">There was an error connecting to the server.</p>
                <button onclick="loadCandidate()" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                    <i class="fas fa-redo mr-2"></i>Try Again
                </button>
            </div>
        `;
    }
}

// Run the function after DOM is ready
window.addEventListener("DOMContentLoaded", loadCandidate);
