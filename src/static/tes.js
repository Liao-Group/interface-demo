function fetchHomepage() {
    fetch('http://18.224.165.91:5000/')
      .then(response => response.text()) // Assuming it's returning HTML
      .then(html => {
        console.log('Homepage HTML:', html);
      })
      .catch(error => {
        console.error('Error fetching homepage:', error);
      });
  }

  
  function postExonSequence(exonSequence) {
    fetch('http://18.224.165.91:5000/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `exon=${encodeURIComponent(exonSequence)}`
    })
    .then(response => response.json())
    .then(data => {
      console.log('Data received:', data);
    })
    .catch(error => {
      console.error('Error posting exon sequence:', error);
    });
  }

  
  function fetchData() {
    fetch('http://18.224.165.91:5000/get-data', {
      method: 'GET' // Change to 'POST' if necessary
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Fetched data:', data);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  }

fetchHomepage();        // To fetch the initial homepage HTML
postExonSequence('CAGUCCCACUUACCAUUGCAUUUAAGAAAGCGGCCAUACGCCGCUAAGACCCUACUCUUCAGAAUACCAG'); // To post an RNA sequence
fetchData();            // To fetch stored data
