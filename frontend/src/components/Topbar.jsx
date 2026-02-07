import SearchFilters from "./SearchFilters";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const Topbar = ({
  search,
  setSearch,
  showSearch = true,
}) => {
  return (
    <div className="sticky top-0 z-20 bg-cream/90 pt-4 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="shrink-0">
          <h2 className="text-2xl font-semibold text-ink">{getGreeting()}, Admin</h2>
        </div>

        {showSearch && (
          <div className="flex-1">
            <SearchFilters
              search={search}
              setSearch={setSearch}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Topbar;
