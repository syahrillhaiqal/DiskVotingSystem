// Global variables
let selectedCandidates = new Map(); // Map to store candidate ID -> name
let currentStudentId = '';

// When student submitting student id
document.getElementById('studentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('studentId').value.trim();
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    
    if (studentId !== '') {
        // Show loading state
        btnText.innerHTML = '<span class="spinner mr-2"></span>Verifying...';
        submitBtn.disabled = true;
        
        // Simulate verification
        setTimeout(() => {
            currentStudentId = studentId;
            
            // Hide student ID section
            document.getElementById('studentIdSection').classList.add('hidden');
            
            // Show candidates section
            document.getElementById('candidatesSection').classList.remove('hidden');
            
            // Update instruction text
            document.getElementById('instruction-text').textContent = 
                `Welcome, Student ID: ${studentId}. Please select your preferred candidates.`;
            
            // Show action bar
            document.getElementById('actionBar').classList.remove('hidden');
            
            // Reset button
            btnText.textContent = 'Continue to Vote';
            submitBtn.disabled = false;
        }, 1000);
    }
});

// Candidate selection
document.querySelectorAll('.candidate-selector').forEach(selector => {
    selector.addEventListener('click', function() {
        const candidateId = this.dataset.candidate;
        const candidateName = this.dataset.name;
        const radio = this.querySelector('.custom-radio');
        const card = this.closest('.candidate-card');
        
        if (selectedCandidates.has(candidateId)) {
            // Deselect
            selectedCandidates.delete(candidateId);
            radio.classList.remove('checked');
            this.classList.remove('selected');
            card.classList.remove('selected');
        } else {
            // Check if already selected 2 candidates
            if (selectedCandidates.size >= 2) {
                showAlert('You can only select up to 2 candidates. Please deselect one first.', 'warning');
                return;
            }
            
            // Select
            selectedCandidates.set(candidateId, candidateName);
            radio.classList.add('checked');
            this.classList.add('selected');
            card.classList.add('selected');
        }
        
        // Update vote counter
        document.getElementById('voteCount').textContent = selectedCandidates.size;
        
        // Update confirmation section
        updateConfirmationSection();
    });
});

function updateConfirmationSection() {
    const confirmationSection = document.getElementById('confirmationSection');
    const selectedCandidatesList = document.getElementById('selectedCandidatesList');
    const actionBar = document.getElementById('actionBar');
    
    if (selectedCandidates.size > 0) {
        // Show confirmation section
        confirmationSection.classList.remove('hidden');
        // Show action bar
        actionBar.classList.remove('hidden');
        // Clear previous list
        selectedCandidatesList.innerHTML = '';
        // Add selected candidates to the list
        selectedCandidates.forEach((name, id) => {
            const candidateItem = document.createElement('div');
            candidateItem.className = 'flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200';
            candidateItem.innerHTML = `
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-check text-white text-sm"></i>
                    </div>
                    <span class="font-semibold text-green-800">${name}</span>
                </div>
                <button 
                    onclick="removeCandidate('${id}')" 
                    class="text-red-500 hover:text-red-700 transition-colors"
                    title="Remove ${name}"
                >
                    <i class="fas fa-times"></i>
                </button>
            `;
            selectedCandidatesList.appendChild(candidateItem);
        });
    } else {
        // Hide confirmation section
        confirmationSection.classList.add('hidden');
        // Hide action bar
        actionBar.classList.add('hidden');
    }
}

function removeCandidate(candidateId) {
    const selector = document.querySelector(`[data-candidate="${candidateId}"]`);
    if (selector) {
        const radio = selector.querySelector('.custom-radio');
        const card = selector.closest('.candidate-card');
        // Remove from selection
        selectedCandidates.delete(candidateId);
        radio.classList.remove('checked');
        selector.classList.remove('selected');
        card.classList.remove('selected');
        // Update vote counter
        document.getElementById('voteCount').textContent = selectedCandidates.size;
        // Update confirmation section and action bar
        updateConfirmationSection();
    }
}

function cancelVote() {
    // Clear all selections
    selectedCandidates.clear();
    document.querySelectorAll('.candidate-selector').forEach(selector => {
        const radio = selector.querySelector('.custom-radio');
        const card = selector.closest('.candidate-card');
        radio.classList.remove('checked');
        selector.classList.remove('selected');
        card.classList.remove('selected');
    });
    // Update counter
    document.getElementById('voteCount').textContent = '0';
    // Hide confirmation section and action bar
    document.getElementById('confirmationSection').classList.add('hidden');
    document.getElementById('actionBar').classList.add('hidden');
}

function submitVote() {
    //alert("test");
    if (selectedCandidates.size === 0) {
        showAlert('Please select at least one candidate before submitting.', 'warning');
        return;
    }

    

    // Populate the confirmation modal with selected candidates
    const confirmationCandidatesList = document.getElementById('confirmationCandidatesList');
    confirmationCandidatesList.innerHTML = '';
    selectedCandidates.forEach((name) => {
        const candidateItem = document.createElement('div');
        candidateItem.className = 'flex items-center p-3 bg-green-50 rounded-lg border border-green-200';
        candidateItem.innerHTML = `
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <i class="fas fa-check text-white text-sm"></i>
            </div>
            <span class="font-semibold text-green-800">${name}</span>
        `;
        confirmationCandidatesList.appendChild(candidateItem);
    });

    // Show the confirmation modal
    const modal = document.getElementById('confirmationModal');
    modal.classList.add('show');
    modal.classList.remove('opacity-0', 'invisible');
}

function closeConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    modal.classList.remove('show');
    modal.classList.add('opacity-0', 'invisible');
}

function confirmAndSubmitVote() {
    closeConfirmationModal();
    let candidates = Array.from(selectedCandidates.values());
    console.log("TEst",candidates);
    const submitBtn = document.getElementById('submitVoteBtn');
    const originalContent = submitBtn.innerHTML;
    // Show loading state
    submitBtn.innerHTML = '<span class="spinner mr-2"></span>Submitting...';
    submitBtn.disabled = true;
    // Simulate submission
    setTimeout(() => {
        // Show success modal
        document.getElementById('successModal').classList.add('show');
        // Reset button
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
        // Log vote data
        console.log('Vote submitted:', {
            studentId: currentStudentId,
            candidates: Array.from(selectedCandidates.entries()),
        });
    }, 1500);
}

function resetVoting() {
    // Reset all states
    selectedCandidates.clear();
    currentStudentId = '';
    
    // Hide success modal
    document.getElementById('successModal').classList.remove('show');
    
    // Hide action bar
    document.getElementById('actionBar').classList.add('hidden');
    
    // Hide candidates section
    document.getElementById('candidatesSection').classList.add('hidden');
    
    // Hide confirmation section
    document.getElementById('confirmationSection').classList.add('hidden');
    
    // Show student ID section
    document.getElementById('studentIdSection').classList.remove('hidden');
    
    // Reset form
    document.getElementById('studentForm').reset();
    
    // Reset instruction text
    document.getElementById('instruction-text').textContent = 
        'Please enter your student ID to begin voting';
    
    // Clear selections
    document.querySelectorAll('.candidate-selector').forEach(selector => {
        const radio = selector.querySelector('.custom-radio');
        const card = selector.closest('.candidate-card');
        
        radio.classList.remove('checked');
        selector.classList.remove('selected');
        card.classList.remove('selected');
    });
    
    // Reset vote counter
    document.getElementById('voteCount').textContent = '0';
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
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

async function checkID(){
     const id = document.getElementById("id").value;

    console.log("hello")
    console.log("id", id);
  
    try {
        const response = await fetch('http://localhost:5000/check', {
            method: 'Post',
            headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({id }),
        })

         const data = await response.json();
        
        if (response.ok) {
           console.log("StudentData",data)
           window.location.href = "vote.html?id=" + id;
        } else {
           console.log("Student DNE")
        }
        
    } catch (error) {
        
    }
}

function addVote() {
    alert("test");
 const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  console.log("id",id); 
  const selected = Array.from(document.querySelectorAll('input[name="vote"]:checked'));
  
  if (selected.length !== 2) {
    alert("You must select exactly 2 candidates.");
    return;
  }

  const voteValues = selected.map(box => box.value);
  console.log("Voted for:", voteValues);
  console.log("id",id);

  fetch('http://localhost:5000/addVote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ votes: voteValues, id })
  })
  .then(res => res.json())
  .then(data => {
    alert("Votes successfully recorded.");
    window.location.href = "index.html";
  })
  .catch(err => {
    console.error("Vote error:", err);
    alert("Error submitting vote.");
  });
}

async function loadCandidate() {
  try {
    const response = await fetch('http://localhost:5000/getCandidates');
    const { candidates } = await response.json();
    console.log(candidates);

    const container = document.getElementById('loadCandidates');
    container.innerHTML = '';

    candidates.forEach((candidate, index) => {
      const card = document.createElement('div');
      card.className =
        'candidate-card bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl border-3 border-transparent';
      card.innerHTML = `
        <img
          src="../assets/img/image.png"
          class="w-full h-48 md:h-64 object-cover"
          alt="Candidate ${index + 1}"
        />
        <div class="p-5 md:p-6">
          <div class="rounded-xl overflow-hidden mb-4">
            <iframe
              class="w-full h-48 md:h-56 border-0"
              src="https://www.youtube.com/embed/YEU_GYS7yqI?si=GOb92SCqD9duF8Sb"
              title="Campaign Video"
              allowfullscreen
            ></iframe>
          </div>
          <p class="text-gray-600 italic p-4 bg-gray-50 rounded-lg border-l-4 border-primary-400 m-0">
            <i class="fas fa-quote-left mr-2"></i>
            "Committed to improving student life and academic excellence through innovative programs and inclusive leadership."
          </p>
          <div
            class="candidate-selector flex items-center gap-4 p-4 bg-gray-200 rounded-xl cursor-pointer my-4 transition-all duration-300 hover:bg-gray-100"
            data-candidate="${candidate.id}"
            data-name="${candidate.name}"
          >
            <div class="custom-radio w-6 h-6 border-3 border-primary-400 rounded-full flex-shrink-0 relative"></div>
            <h3 class="candidate-name text-sm md:text-2xl font-bold m-0">Vote for ${candidate.name}</h3>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    // 🔁 Attach event listeners to the dynamically added selectors
    document.querySelectorAll('.candidate-selector').forEach(selector => {
      selector.addEventListener('click', function () {
        const candidateId = this.dataset.candidate;
        const candidateName = this.dataset.name;
        const radio = this.querySelector('.custom-radio');
        const card = this.closest('.candidate-card');

        if (selectedCandidates.has(candidateId)) {
          // Deselect
          selectedCandidates.delete(candidateId);
          radio.classList.remove('checked');
          this.classList.remove('selected');
          card.classList.remove('selected');
        } else {
          // Limit to 2 selections
          if (selectedCandidates.size >= 2) {
            showAlert('You can only select up to 2 candidates. Please deselect one first.', 'warning');
            return;
          }

          // Select
          selectedCandidates.set(candidateId, candidateName);
          radio.classList.add('checked');
          this.classList.add('selected');
          card.classList.add('selected');
        }

        document.getElementById('voteCount').textContent = selectedCandidates.size;
        updateConfirmationSection();
      });
    });

  } catch (error) {
    console.error("Error loading candidates:", error);
  }
}


// Run the function after DOM is ready
window.addEventListener('DOMContentLoaded', loadCandidate);
