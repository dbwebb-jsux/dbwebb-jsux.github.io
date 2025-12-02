const variables = document.getElementById("variables-style")
const modeSelect = document.getElementById("mode")

modeSelect.addEventListener("change", function(event) {
  variables.setAttribute("href", event.target.value)
  localStorage.setItem("mode", event.target.value)
})

const currentMode = localStorage.getItem("mode") || "variables-dark.css"
variables.setAttribute("href", currentMode)
modeSelect.value = currentMode