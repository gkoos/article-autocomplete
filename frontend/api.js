export async function fetchSuggestions(q) {
  const res = await fetch(`http://localhost:4000/autocomplete?q=${encodeURIComponent(q)}`);
  return res.json();
}

export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
