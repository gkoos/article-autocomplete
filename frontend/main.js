import { debounce, fetchSuggestions } from "./api.js";

const input = document.getElementById("search");
const results = document.getElementById("results");

const render = (items) => {
  results.innerHTML = "";
  items.forEach(({ phrase, count }) => {
    const li = document.createElement("li");
    li.textContent = `${phrase} (${count})`;
    results.appendChild(li);
  });
};

const handleInput = debounce(async (e) => {
  const q = e.target.value.trim().toLowerCase();
  if (!q) return (results.innerHTML = "");
  const data = await fetchSuggestions(q);
  render(data);
}, 250);

input.addEventListener("input", handleInput);
