// variable for turning the button on and off. 
let defaultSetting = "off";
// toggle outline

// check for toggle state before refreshing
document.addEventListener('DOMContentLoaded', function () {
  const toggleButton = document.getElementById('toggleButton');

  // toggle circle
  const toggleSwitchCircle = document.getElementById('toggleSwitchCircle');
  defaultSetting = localStorage.getItem('defaultSetting') || "off";
  if (defaultSetting === "on") {
    toggleSwitchCircle.style.transform = 'translateX(20px)';
    toggleButton.style.backgroundColor = '#0e6f07';
    // Change to ltr colors
    inclusion_color = ltr_inclusion_color;
    inclusion_highlight_color = ltr_inclusion_highlight_color;
    skipping_color = ltr_skipping_color;
    skipping_highlight_color = ltr_skipping_highlight_color;
  }
  else {
    toggleSwitchCircle.style.transform = 'translateX(0)';
    toggleButton.style.backgroundColor = 'white';
    // Change to org colors
    inclusion_color = org_inclusion_color;
    inclusion_highlight_color = org_inclusion_highlight_color;
    skipping_color = org_skipping_color;
    skipping_highlight_color = org_skipping_highlight_color;
  }
  toggleButton.addEventListener('click', function () {
  if (defaultSetting === "off") {
    defaultSetting = "on";
    toggleSwitchCircle.style.transform = 'translateX(20px)';
    toggleButton.style.backgroundColor = '#0e6f07';
  }
  else {
    defaultSetting = "off";
    toggleSwitchCircle.style.transform = 'translateX(0)';
    toggleButton.style.backgroundColor = 'white';
  }
  // save toggle state and refresh
  localStorage.setItem('defaultSetting', defaultSetting);
  location.reload();
});
});

// setting dropdown
function toggleDropdown() {
  var dropdown = document.getElementById("myDropdown");
  if (dropdown.style.display === "block") {
      dropdown.style.display = "none";
  }
  else {
      dropdown.style.display = "block";
  }
}

// event for when the screen is resized and we need to re-render the graphs in the page again

window.addEventListener('resize',function(){
  featureSelection(featureSelected=null,className = null)
  PSIview(Data); // Redraw the graph with the same data
  hierarchicalBarChart(Data, Data.feature_activations)
  nucleotideView(Data.sequence, Data.structs, Data.nucleotide_activations)
  hierarchicalBarChart2(featuresParent, featuresChildren)
  hierarchicalBarChart3(positionsParent,positionsChildren )
});

document.addEventListener("DOMContentLoaded", async function() {
  const form = document.getElementById("exonForm");
  const selectElement = document.getElementById("option");

  let selectedOption = localStorage.getItem("selectedOption");

  if (!selectedOption) {
      selectedOption = 'teaser'; // Default to 'teaser' if nothing in storage
      localStorage.setItem("selectedOption", selectedOption);
  }

  selectElement.value = selectedOption;
  await fetchData(selectedOption); // Fetch data immediately on load

  selectElement.addEventListener("change", async function() {
      const selectedValue = selectElement.value;
      localStorage.setItem("selectedOption", selectedValue);
      await fetchData(selectedValue);
  });
});



document.addEventListener("DOMContentLoaded", async function() {

// listening to event from the rewind button on the feature legend
document.getElementById("rewindButton1").addEventListener('click', function() {
  resetGraph();
});

// listening to event from the rewind b
document.getElementById("rewindButton2").addEventListener('click', function() {
  resetGraph();
});

// run download fucntion once selected 
document.querySelector('.svg-select button').addEventListener('click', downloadSelectedSVGs);

 // Get the form element
 var form = document.getElementById('exonForm');
 // Add submit event listener to the form
 form.addEventListener('submit', function(event) {
   // Prevent the default form submission behavior
   event.preventDefault();
   // Access the value of the input
   var exonValue = document.getElementById('exon').value;
   console.log(exonValue);
   fetchData(exonValue)
 });
})
