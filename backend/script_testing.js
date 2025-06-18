// Global variables
let selectedCandidates = new Map(); // Map to store candidate ID -> name
let currentStudentId = '';

// Student form submission
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
            timestamp: new Date().toISOString()
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