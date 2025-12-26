import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { dataService } from "@/lib/dataService";
import type { Product, Category } from "@/types";
import ProductCard from "@/components/ProductCard";
import { useModal } from "@/store/useModal";
import { cn, formatPrice } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Filter,
  X,
  Search,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  ArrowUpDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingScreen from "@/components/LoadingScreen";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const openProductModal = useModal((state) => state.openProductModal);

  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("default");
  const itemsPerPage = 16;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    Promise.all([dataService.getProducts(), dataService.getCategories()])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Extract unique filters from data
  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand.name))),
    [products]
  );
  const sizes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.sizes))),
    [products]
  );
  const colors = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.colors))),
    [products]
  );

  useEffect(() => {
    const catSlug = searchParams.get("category");
    const search = searchParams.get("search");
    const type = searchParams.get("type");

    if (catSlug) {
      const category = categories.find((c) => c.slug === catSlug);
      if (category && !selectedCategories.includes(category.id)) {
        setSelectedCategories([category.id]);
      }
    }
    if (search) setSearchQuery(search);
    if (type) setFilterType(type);
  }, [searchParams, categories]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.categoryId);
      const matchesBrand =
        selectedBrands.length === 0 ||
        selectedBrands.includes(product.brand.name);
      const matchesSize =
        selectedSizes.length === 0 ||
        product.sizes.some((s) => selectedSizes.includes(s));
      const matchesColor =
        selectedColors.length === 0 ||
        product.colors.some((c) => selectedColors.includes(c));
      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        !filterType ||
        (filterType === "featured" && product.isFeatured) ||
        (filterType === "new" && product.isNewArrival) ||
        (filterType === "promotion" && product.isPromotion);

      return (
        matchesPrice &&
        matchesCategory &&
        matchesBrand &&
        matchesSize &&
        matchesColor &&
        matchesSearch &&
        matchesType
      );
    });
  }, [
    products,
    priceRange,
    selectedCategories,
    selectedBrands,
    selectedSizes,
    selectedColors,
    searchQuery,
    filterType,
  ]);

  // Sorted products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortBy) {
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "brand":
        return sorted.sort((a, b) => a.brand.name.localeCompare(b.brand.name));
      case "newest":
        return sorted.sort((a, b) => b.id.localeCompare(a.id));
      case "oldest":
        return sorted.sort((a, b) => a.id.localeCompare(b.id));
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, sortedProducts.length);

  // Reset to page 1 when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProducts, sortBy]);

  const clearFilters = () => {
    setPriceRange([0, 10000]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSearchQuery("");
    setFilterType(null);
    setSearchParams({});
  };

  // Filter content component (reusable for both desktop and mobile)
  const FilterContent = () => (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-bold uppercase tracking-widest italic">
            Filters
          </h2>
        </div>
        {(selectedCategories.length > 0 ||
          selectedBrands.length > 0 ||
          selectedSizes.length > 0 ||
          selectedColors.length > 0 ||
          priceRange[0] > 0 ||
          priceRange[1] < 10000 ||
          searchQuery ||
          filterType) && (
          <button
            onClick={clearFilters}
            className="text-[10px] uppercase font-bold text-primary hover:text-white transition-colors flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>
      <div className="h-1 w-10 bg-primary -mt-6"></div>

      {/* Search in Shop */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted">
          Search
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted h-11 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Price Filter */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted">
          Price Range
        </h3>
        <Slider
          defaultValue={[0, 10000]}
          max={10000}
          step={50}
          value={priceRange}
          onValueChange={setPriceRange}
          className="py-4"
        />
        <div className="flex items-center justify-between text-sm font-bold text-white italic">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted">
          Categories
        </h3>
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center space-x-3 group cursor-pointer"
              onClick={() => {
                setSelectedCategories((prev) =>
                  prev.includes(cat.id)
                    ? prev.filter((id) => id !== cat.id)
                    : [...prev, cat.id]
                );
              }}
            >
              <Checkbox
                id={cat.id}
                checked={selectedCategories.includes(cat.id)}
                className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label className="text-sm font-bold uppercase tracking-wider text-muted group-hover:text-white cursor-pointer transition-colors">
                {cat.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted">
          Brands
        </h3>
        <div className="flex flex-col gap-3">
          {brands.map((brand) => (
            <div
              key={brand}
              className="flex items-center space-x-3 group cursor-pointer"
              onClick={() => {
                setSelectedBrands((prev) =>
                  prev.includes(brand)
                    ? prev.filter((b) => b !== brand)
                    : [...prev, brand]
                );
              }}
            >
              <Checkbox
                id={brand}
                checked={selectedBrands.includes(brand)}
                className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label className="text-sm font-bold uppercase tracking-wider text-muted group-hover:text-white cursor-pointer transition-colors">
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div className="space-y-5 hidden">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted">
          Colors
        </h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() =>
                setSelectedColors((prev) =>
                  prev.includes(color)
                    ? prev.filter((c) => c !== color)
                    : [...prev, color]
                )
              }
              className={cn(
                "h-7 w-7 rounded-full border-2 transition-all",
                selectedColors.includes(color)
                  ? "border-white ring-2 ring-primary"
                  : "border-transparent"
              )}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Size Filter */}
      <div className="space-y-5 hidden">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted">
          Sizes
        </h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() =>
                setSelectedSizes((prev) =>
                  prev.includes(size)
                    ? prev.filter((s) => s !== size)
                    : [...prev, size]
                )
              }
              className={cn(
                "px-2 py-1 min-w-10 rounded border text-[10px] font-bold uppercase transition-all",
                selectedSizes.includes(size)
                  ? "bg-primary border-primary text-white"
                  : "bg-white/5 border-white/10 text-muted hover:border-white/20"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="bg-background min-h-screen pt-32 pb-20">
      <div className="container px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8 relative items-start">
          {/* Filter Toggle Button (Desktop) */}
          <button
            onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
            className="hidden md:flex absolute -left-7 -top-16 h-auto w-10 flex-col items-center justify-center gap-1 bg-primary/10 rounded-lg border border-primary/20 hover:bg-primary hover:border-primary transition-all z-10 py-3 group"
            title={isFilterCollapsed ? "Show Filters" : "Hide Filters"}
          >
            <Filter className="h-4 w-4 text-primary group-hover:text-white transition-colors" />
            <span className="text-[8px] font-bold uppercase tracking-wider text-primary group-hover:text-white transition-colors writing-mode-vertical">
              {isFilterCollapsed ? "Show" : "Hide"}
            </span>
          </button>

          {/* Desktop Sidebar */}
          <aside
            className={cn(
              "hidden md:flex w-full md:w-64 flex-col gap-10 transition-all duration-300",
              isFilterCollapsed
                ? "md:w-0 md:opacity-0 md:pointer-events-none md:-ml-8"
                : "md:opacity-100"
            )}
          >
            <FilterContent />
          </aside>

          {/* Mobile Filter Sheet */}
          <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
            <SheetContent
              side="left"
              className="w-full sm:max-w-md bg-background border-white/10 text-white p-0"
            >
              <SheetHeader className="p-6 pb-4 border-b border-white/10">
                <SheetTitle className="text-primary font-bold text-xl italic uppercase tracking-widest">
                  Filters
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-80px)] px-6 py-6">
                <div className="flex flex-col gap-10">
                  <FilterContent />
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* Product Grid */}
          <div
            className={cn(
              "flex-1 transition-all duration-300",
              isFilterCollapsed ? "md:w-full" : ""
            )}
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <div className="flex items-center gap-4">
                <Sheet
                  open={isMobileFilterOpen}
                  onOpenChange={setIsMobileFilterOpen}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      className="md:hidden flex items-center gap-2 text-white bg-white/5 border border-white/10 h-10 px-4"
                    >
                      <Filter className="h-4 w-4" /> Filters
                    </Button>
                  </SheetTrigger>
                </Sheet>
              </div>

              <div className="flex items-center gap-4">
                {/* Sorting Dropdown */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-muted" />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white h-10">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-bg-secondary border-white/10 text-white">
                      <SelectItem
                        value="default"
                        className="focus:bg-white/10 focus:text-white"
                      >
                        Default
                      </SelectItem>
                      <SelectItem
                        value="price-asc"
                        className="focus:bg-white/10 focus:text-white"
                      >
                        Price: Low to High
                      </SelectItem>
                      <SelectItem
                        value="price-desc"
                        className="focus:bg-white/10 focus:text-white"
                      >
                        Price: High to Low
                      </SelectItem>
                      <SelectItem
                        value="brand"
                        className="focus:bg-white/10 focus:text-white"
                      >
                        Brand: A-Z
                      </SelectItem>
                      <SelectItem
                        value="newest"
                        className="focus:bg-white/10 focus:text-white"
                      >
                        Newest First
                      </SelectItem>
                      <SelectItem
                        value="oldest"
                        className="focus:bg-white/10 focus:text-white"
                      >
                        Oldest First
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Showing results */}
                {sortedProducts.length > 0 && (
                  <span className="text-xs hidden md:block font-bold text-muted uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    Showing {startIndex + 1}-{endIndex} of{" "}
                    {sortedProducts.length} results
                  </span>
                )}
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center text-muted italic flex flex-col items-center gap-4">
                <p>No products found matching your filters.</p>
                <Button
                  variant="link"
                  onClick={clearFilters}
                  className="text-primary uppercase font-bold"
                >
                  Show all products
                </Button>
              </div>
            ) : (
              <>
                {/* Showing results */}
                {sortedProducts.length > 0 && (
                  <span className="text-xs font-bold md:hidden text-muted uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    Showing {startIndex + 1}-{endIndex} of{" "}
                    {sortedProducts.length} results
                  </span>
                )}

                <div
                  className={cn(
                    "grid gap-6 transition-all duration-300 pt-10 md:pt-0",
                    isFilterCollapsed
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  )}
                >
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={openProductModal}
                      showTag={false}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-20 flex flex-col items-center gap-6">
                <Pagination>
                  <PaginationContent className="gap-3 flex-wrap justify-center">
                    <PaginationItem>
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className={cn(
                          "rounded-full border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white transition-all h-10 w-10 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none group shadow-sm"
                        )}
                        title="Previous Page"
                      >
                        <PrevIcon className="h-5 w-5" />
                      </button>
                    </PaginationItem>

                    <div className="flex items-center gap-3">
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            onClick={() => setCurrentPage(i + 1)}
                            isActive={currentPage === i + 1}
                            className={cn(
                              "cursor-pointer rounded-full h-10 w-10 flex items-center justify-center font-bold text-sm transition-all border-2 shadow-sm",
                              currentPage === i + 1
                                ? "bg-primary border-primary text-white hover:bg-primary hover:text-white"
                                : "bg-white border-primary text-primary hover:bg-white hover:text-primary"
                            )}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                    </div>

                    <PaginationItem>
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className={cn(
                          "rounded-full border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white transition-all h-10 w-10 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none group shadow-sm"
                        )}
                        title="Next Page"
                      >
                        <NextIcon className="h-5 w-5" />
                      </button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
