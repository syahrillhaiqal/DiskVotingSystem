window.addEventListener("load", () => {
      document.body.classList.add("loaded");
    });

async function fetchData() {
    
     const response = await fetch(`http://localhost:5000/getCandidates`);
        const { candidates } = await response.json();
        console.log(candidates);

    const totalVotes = candidates.reduce((total, candidate) => total + candidate.total_votes, 0);
    console.log(totalVotes);
    
   candidates.forEach((candidate) => {
        const percent = (candidate.total_votes / totalVotes * 100).toFixed(1);

        const progressDiv = document.createElement("div");
        progressDiv.className = "mb-6";

        progressDiv.innerHTML = `
          <div class="mb-1 text-lg font-medium dark:text-white">${candidate.name}</div>
          <div class="mb-1 text-sm dark:text-gray-300">Total votes: ${candidate.total_votes}</div>
          <div class="w-full h-4 bg-gray-200 rounded-full dark:bg-gray-700">
            <div class="h-4 bg-blue-600 rounded-full dark:bg-blue-500 progress-fill" style="width: ${percent}%;"></div>
          </div>
        `;

        container.appendChild(progressDiv);
      });
}

fetchData();