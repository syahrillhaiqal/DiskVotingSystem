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
