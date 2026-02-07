const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-slate"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const SearchFilters = ({
  search,
  setSearch,
}) => {
  return (
    <div className="relative">
      <input
        className="w-full rounded-full bg-white/95 px-5 py-2.5 pr-10 text-sm text-slate shadow-soft outline-none transition focus:ring-2 focus:ring-pastel-pink"
        placeholder="Search employees by name, ID, department, role..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <SearchIcon />
      </div>
    </div>
  );
};

export default SearchFilters;
