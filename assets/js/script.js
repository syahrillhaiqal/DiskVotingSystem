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

// Carousel variables
let currentSlide = 0;
let totalSlides = 0;
let slidesPerView = 1; // Will be calculated based on screen size

// Calculate slides per view based on screen size
function calculateSlidesPerView() {
    const width = window.innerWidth;
    if (width >= 1200) { // lg screens and above
        return 3;
    } else if (width >= 768) { // md screens (tablet)
        return 2;
    } else { // sm and below - mobile first (phones)
        return 1;
    }
}

// Update position indicator
function updatePositionIndicator() {
    const currentPositionEl = document.getElementById('currentPosition');
    const totalCandidatesEl = document.getElementById('totalCandidates');
    
    if (currentPositionEl && totalCandidatesEl) {
        currentPositionEl.textContent = currentSlide + 1;
        totalCandidatesEl.textContent = totalSlides;
    }
}

// Update carousel navigation
function updateCarouselNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // Show/hide navigation buttons
    prevBtn.style.display = currentSlide === 0 ? 'none' : 'block';
    nextBtn.style.display = currentSlide >= totalSlides - slidesPerView ? 'none' : 'block';
    
    // Update position indicator
    updatePositionIndicator();
}

// Move carousel to specific slide
function goToSlide(slideIndex) {
    const track = document.getElementById('carouselTrack');
    
    // Calculate slide width based on screen size
    const width = window.innerWidth;
    let slideWidth;
    if (width >= 1200) {
        slideWidth = 33.333; // 3 cards per view
    } else if (width >= 768) {
        slideWidth = 50; // 2 cards per view
    } else {
        slideWidth = 100; // 1 card per view on mobile
    }
    
    const translateX = -(slideIndex * slideWidth);
    track.style.transform = `translateX(${translateX}%)`;
    currentSlide = slideIndex;
    updateCarouselNavigation();
}

// Next slide
function nextSlide() {
    if (currentSlide < totalSlides - slidesPerView) {
        goToSlide(currentSlide + 1);
    }
}

// Previous slide
function prevSlide() {
    if (currentSlide > 0) {
        goToSlide(currentSlide - 1);
    }
}

// Handle window resize
function handleResize() {
    const newSlidesPerView = calculateSlidesPerView();
    if (newSlidesPerView !== slidesPerView) {
        slidesPerView = newSlidesPerView;
        
        // Update all slide widths
        const slides = document.querySelectorAll('.carousel-slide');
        const width = window.innerWidth;
        
        slides.forEach(slide => {
            if (width >= 1200) {
                slide.style.width = '33.333%';
            } else if (width >= 768) {
                slide.style.width = '50%';
            } else {
                slide.style.width = '100%';
            }
        });
        
        goToSlide(0); // Reset to first slide
    }
}

// Keyboard navigation support
function handleKeyDown(e) {
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
    }
}

// Touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}

function handleSwipe() {
    const swipeThreshold = 50; // Minimum distance for swipe
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next slide
            nextSlide();
        } else {
            // Swipe right - previous slide
            prevSlide();
        }
    }
}

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
        console.log(candidates);

        const track = document.getElementById("carouselTrack");
        
        // Clear previous content
        track.innerHTML = "";

        if (!candidates || candidates.length === 0) {
            track.innerHTML = `
                <div class="w-full text-center py-8">
                    <i class="fas fa-exclamation-triangle text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600 text-lg">No candidates available at the moment.</p>
                    <p class="text-gray-500 text-sm">Please check back later.</p>
                </div>
            `;
            return;
        }

        // Calculate slides per view
        slidesPerView = calculateSlidesPerView();
        totalSlides = candidates.length;

        // Create carousel slides
        candidates.forEach((candidate, index) => {
            const imageSrc = `${candidate.candidate_poster}`;
            const slide = document.createElement("div");
            slide.className = "carousel-slide flex-shrink-0";
            
            // Calculate width based on screen size
            const width = window.innerWidth;
            if (width >= 1200) {
                slide.style.width = '33.333%'; // 3 cards per view
            } else if (width >= 768) {
                slide.style.width = '50%'; // 2 cards per view
            } else {
                slide.style.width = '100%'; // 1 card per view on mobile
            }
            
            slide.style.padding = '0 10px';
            
            slide.innerHTML = `
                <div class="candidate-card bg-green-50 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl border-3 border-transparent h-full">
                    <div class="w-full aspect-[9/16] bg-gray-200 flex items-center justify-center overflow-hidden">
                        <img
                            src="${imageSrc}"
                            class="object-cover w-full h-full"
                            alt="Candidate ${index + 1}"
                            onerror="this.src='../assets/img/placeholder-profile.jpg'"
                            loading="lazy"
                        />
                    </div>
                    <div class="p-4 md:p-5">
                        <div class="rounded-xl overflow-hidden mb-3 bg-gray-200">
                            <iframe
                                class="w-full h-56 md:h-40 border-0"
                                src="https://www.youtube.com/embed/${candidate.candidates_vid}"
                                title="Campaign Video"
                                loading="lazy"
                                allowfullscreen
                            ></iframe>
                        </div>
                        <div
                            class="candidate-selector flex items-center gap-3 p-3 bg-gray-300 rounded-xl cursor-pointer transition-all duration-300"
                            data-candidate="${candidate.id}"
                            data-name="${candidate.name}"
                        > 
                            <div class="custom-radio w-5 h-5 border-3 border-primary-400 rounded-full flex-shrink-0 relative"></div>
                            <h3 class="candidate-name text-sm md:text-lg font-bold m-0">Vote for ${candidate.name}</h3>
                        </div>
                    </div>
                </div>
            `;
            track.appendChild(slide);
        });

        // Attach event listeners to navigation buttons
        document.getElementById('prevBtn').onclick = prevSlide;
        document.getElementById('nextBtn').onclick = nextSlide;

        // Add touch/swipe support for mobile
        track.addEventListener('touchstart', handleTouchStart, { passive: true });
        track.addEventListener('touchend', handleTouchEnd, { passive: true });

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
                const candidatesSection = document.getElementById("candidatesSection");
                if (selectedCandidates.size > 0) {
                    actionBar.classList.remove("hidden");
                    candidatesSection.classList.add("with-action-bar");
                } else {
                    actionBar.classList.add("hidden");
                    candidatesSection.classList.remove("with-action-bar");
                }
            });
        });

        // Initialize carousel navigation
        updateCarouselNavigation();

        // Add window resize listener
        window.addEventListener('resize', handleResize);

        // Add keyboard navigation
        document.addEventListener('keydown', handleKeyDown);

    } catch (error) {
        console.error("Error loading candidates:", error);
        
        const track = document.getElementById("carouselTrack");
        track.innerHTML = `
            <div class="w-full text-center py-8">
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
