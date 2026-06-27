export const TaiChiLoader = ({ className }) => (
  // viewBox defines canvas size
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="48" fill="currentColor" />
    <path d="M50,2 A48,48 0 0,1 50,98 A24,24 0 0,0 50,50 A24,24 0 0,1 50,2 Z" fill="#fdfbf7" />
    <circle cx="50" cy="26" r="8" fill="#fdfbf7" />
    <circle cx="50" cy="74" r="8" fill="currentColor" />
  </svg>
);