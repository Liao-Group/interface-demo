// variable for turning the button on and off. 
let defaultSetting = "off";
// toggle outline
// also thinking on separating this 
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
  featureSelection(featureSelected=null,className = null,use_new_grouping =use_new_grouping)
  PSIview(Data); // Redraw the graph with the same data
  hierarchicalBarChart(Data, Data.feature_activations)
  nucleotideView(Data.sequence, Data.structs, Data.nucleotide_activations)
  hierarchicalBarChart2(featuresParent, featuresChildren)
  console.log(positionsChildren,positionsParent)
  hierarchicalBarChart3(positionsChildren,positionsParent)
});


document.addEventListener("DOMContentLoaded", async function() {
  const form = document.getElementById("exonForm");
  let selectedOption = localStorage.getItem("selectedOption");
  console.log("Selected option from storage:", selectedOption);

  if (!selectedOption) {
      selectedOption = 'teaser'; // Default to 'teaser' if nothing in storage
      localStorage.setItem("selectedOption", selectedOption);
  }

  document.getElementById("option").value = selectedOption;
  await fetchData(selectedOption); // Fetch data immediately on load

  form.addEventListener("submit", async function(e) {
      e.preventDefault();
      const selectedValue = document.getElementById("option").value;
      localStorage.setItem("selectedOption", selectedValue);
      console.log("New selection saved:", selectedValue);
      await fetchData(selectedValue);
  });
});

async function fetchData(option) {
  try {
      const response = await fetch(`./get-data?option=${option}`);
      const data = await response.json();
      if (data.error) {
          console.error("Error fetching data:", data.error);
          // Optionally, inform the user visually
      } else {
          use_new_grouping = data.use_new_grouping === 1;
          console.log("Using new grouping:", use_new_grouping);
          window.Data = data;
          // Render data
          featureSelection(null, data, use_new_grouping);
          nucleotideView(data.sequence, data.structs, data.nucleotide_activations);
          PSIview(data);
          hierarchicalBarChart(data, data.feature_activations);
      }
  } catch (error) {
      console.error("Failed to fetch or parse data:", error);
      // Optionally, inform the user visually
  }
}
