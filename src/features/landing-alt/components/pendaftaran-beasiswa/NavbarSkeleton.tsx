const NavbarSkeleton = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Skeleton */}
          <div className="flex-shrink-0">
            <img
              src="/images/logo.png"
              alt="KPU Logo"
              className="h-10 w-auto"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Navigation Skeleton */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Button Skeleton */}
            <div className="flex items-center space-x-2">
              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarSkeleton;
