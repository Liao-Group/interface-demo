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

// logic for the selection persistence in the exon selection. 
document.addEventListener("DOMContentLoaded", function () {
  var selectedOption = localStorage.getItem("selectedOption");
  if (selectedOption) {
    document.getElementById("option").value = selectedOption;
  }

  document.getElementById("exonForm").addEventListener("submit", function () {
    var selectedValue = document.getElementById("option").value;
    localStorage.setItem("selectedOption", selectedValue);
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