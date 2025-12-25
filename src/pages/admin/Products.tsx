import { useState, useMemo, useEffect, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Filter as FilterIcon,
  ImagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice, cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useStatus } from "@/components/StatusOverlay";
import { useAdminModals } from "@/lib/admin-modals";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useBrands } from "@/hooks/useBrands";
import { dataService } from "@/lib/dataService";
import { uploadImage } from "@/lib/supabase";
import LoadingScreen from "@/components/LoadingScreen";

const ITEMS_PER_PAGE = 10;

export default function AdminProducts() {
  const {
    products,
    isLoading: productsLoading,
    mutate: mutateProducts,
  } = useProducts();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { brands, isLoading: brandsLoading } = useBrands();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<
    { preview: string; file: File }[]
  >([]);

  // Modal states
  const { isAddProductOpen, closeAddProduct, openAddProduct } =
    useAdminModals();
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states for Add/Edit
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    categoryId: "",
    brandId: "",
    description: "",
    colors: [] as string[],
    sizes: [] as string[],
    images: [] as string[],
    stock: 50,
    isFeatured: false,
    isNewArrival: true,
    isPromotion: false,
    discountPrice: "",
  });

  const showStatus = useStatus((state) => state.showStatus);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || p.categoryId === selectedCategory;
      const matchesBrand =
        selectedBrand === "all" ||
        p.brand?.id === selectedBrand ||
        p.brand?.name?.toLowerCase() === selectedBrand.toLowerCase();
      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [products, searchQuery, selectedCategory, selectedBrand]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedBrand]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isAddProductOpen && !editingProduct) {
      setFormData({
        name: "",
        price: "",
        categoryId: "",
        brandId: "",
        description: "",
        colors: [],
        sizes: [],
        images: [],
        stock: 50,
        isFeatured: false,
        isNewArrival: true,
        isPromotion: false,
        discountPrice: "",
      });
      setPendingUploads([]);
    }
  }, [isAddProductOpen, editingProduct]);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      categoryId: product.categoryId,
      brandId: product.brandId,
      description: product.description || "",
      colors: product.colors || [],
      sizes: product.sizes || [],
      images: product.images || [],
      stock: product.stock,
      isFeatured: product.isFeatured || false,
      isNewArrival: product.isNewArrival || false,
      isPromotion: product.isPromotion || false,
      discountPrice: product.discountPrice?.toString() || "",
    });
  };

  const handleSaveProduct = async () => {
    if (
      !formData.name ||
      !formData.price ||
      !formData.categoryId ||
      !formData.brandId
    ) {
      showStatus("error", "Error", "Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      showStatus(
        "loading",
        "Processing...",
        "Uploading images and saving product..."
      );

      // Handle image uploads
      const finalImages = await Promise.all(
        formData.images.map(async (img: string) => {
          const pending = pendingUploads.find((p: any) => p.preview === img);
          if (pending) {
            return await uploadImage(pending.file, "products");
          }
          return img;
        })
      );

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        brandId: formData.brandId,
        images:
          finalImages.length > 0 ? finalImages : ["/products/placeholder.png"],
        colors: formData.colors,
        sizes: formData.sizes,
        stock: formData.stock,
        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        isPromotion: formData.isPromotion,
        discountPrice: formData.isPromotion
          ? parseFloat(formData.discountPrice)
          : null,
      };

      if (editingProduct) {
        await dataService.updateProduct(editingProduct.id, productData);
        showStatus("success", "Updated", "Product updated successfully");
        setEditingProduct(null);
      } else {
        await dataService.createProduct(productData);
        showStatus("success", "Added", "Product added successfully");
        closeAddProduct();
      }
      mutateProducts();
    } catch (error: any) {
      showStatus("error", "Error", error.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await dataService.deleteProduct(productToDelete.id);
      showStatus("success", "Deleted", "Product removed successfully");
      setProductToDelete(null);
      mutateProducts();
    } catch (error: any) {
      showStatus("error", "Error", error.message || "Failed to delete product");
    }
  };

  const toggleSelection = (
    list: string[],
    item: string,
    setList: (val: string[]) => void
  ) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const preview = reader.result as string;
          setPendingUploads((prev: { preview: string; file: File }[]) => [
            ...prev,
            { preview, file },
          ]);
          setFormData((prev: any) => ({
            ...prev,
            images: [...prev.images, preview],
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  if (productsLoading || categoriesLoading || brandsLoading) {
    return <LoadingScreen />;
  }

  console.log({ paginatedProducts });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-4xl font-semibold text-black italic uppercase tracking-tighter">
          Products
        </h1>
        <Button
          onClick={openAddProduct}
          className="bg-primary hover:bg-primary/90 text-white font-semibold h-11 px-8 rounded-lg shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/30" />
            <Input
              placeholder="Search products or brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-black/5 border-none h-12 rounded-xl text-black placeholder:text-black/30 w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "h-12 border-black/5 rounded-xl px-4 gap-2",
                isFilterOpen && "bg-black text-white"
              )}
            >
              <FilterIcon className="h-4 w-4" />
              Filters
            </Button>
            {(searchQuery ||
              selectedCategory !== "all" ||
              selectedBrand !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedBrand("all");
                }}
                className="h-12 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {isFilterOpen && (
          <div className="flex flex-wrap gap-4 pt-4 border-t border-black/5 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold uppercase text-black/40 ml-1">
                Category
              </Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-[200px] h-11 bg-black/5 border-none rounded-xl text-black">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border-black/10">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold uppercase text-black/40 ml-1">
                Brand
              </Label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="w-full sm:w-[200px] h-11 bg-black/5 border-none rounded-xl text-black">
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border-black/10">
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-[#0D0D0D] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-4 lg:px-8 py-5 text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em]">
                  Product Info
                </th>
                <th className="px-4 lg:px-8 py-5 text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em]">
                  Brand
                </th>
                <th className="px-4 lg:px-8 py-5 text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em]">
                  Category
                </th>
                <th className="px-4 lg:px-8 py-5 text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em]">
                  Price
                </th>
                <th className="px-8 py-5 text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-white/5 transition-all group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-white/10 p-2 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                          <img
                            src={product.images[0]}
                            alt=""
                            className="h-full w-full object-contain drop-shadow-lg"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white leading-none mb-1 group-hover:text-primary transition-colors">
                            {product.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-white/80">
                        {product.brand.name}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-semibold uppercase tracking-widest border-white/10 text-white/40 py-1"
                      >
                        {categories.find((c) => c.id === product.categoryId)
                          ?.name || "N/A"}
                      </Badge>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        {product.isPromotion && product.discountPrice ? (
                          <>
                            <span className="text-sm font-semibold text-primary italic tracking-tight">
                              {formatPrice(product.discountPrice)}
                            </span>
                            <span className="text-[10px] text-white/30 line-through">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-semibold text-primary italic tracking-tight">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                          className="text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setProductToDelete(product)}
                          className="text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-20 text-center text-white/20 font-semibold uppercase italic tracking-widest"
                  >
                    No products found Matching your Filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination System */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-white/5 flex items-center justify-between bg-white/5">
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
              Showing{" "}
              <span className="text-white">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              to{" "}
              <span className="text-white">
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  filteredProducts.length
                )}
              </span>{" "}
              results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="h-10 w-10 border-white/10 bg-transparent text-white hover:bg-white/10 rounded-xl"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="h-10 w-10 border-white/10 bg-transparent text-white hover:bg-white/10 rounded-xl"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <Dialog
        open={isAddProductOpen || !!editingProduct}
        onOpenChange={(val) => {
          if (!val) {
            closeAddProduct();
            setEditingProduct(null);
          }
        }}
        modal={false}
      >
        <DialogContent
          className="bg-white border-none max-w-4xl p-0 overflow-x-hidden overflow-y-scroll rounded-[20px] max-h-[calc(100vh-1rem)]"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Add Product</DialogTitle>
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-semibold text-black tracking-tight uppercase italic">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={() => {
                  closeAddProduct();
                  setEditingProduct(null);
                }}
                className="h-8 w-8 rounded-full border border-red-500 flex items-center justify-center hover:bg-red-50 transition-all shadow-sm"
              >
                <X className="h-5 w-5 text-red-500" strokeWidth={3} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-black/60">
                    Product Name
                  </Label>
                  <Input
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="h-12 border-black/10 rounded-lg bg-white text-black font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-black/60">
                      Brand
                    </Label>
                    <Select
                      value={formData.brandId}
                      onValueChange={(v) =>
                        setFormData({ ...formData, brandId: v })
                      }
                    >
                      <SelectTrigger className="h-12 border-black/10 rounded-lg bg-white text-black font-medium">
                        <SelectValue placeholder="Select Brand" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-black/10 text-black">
                        {brands.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-black/60">
                      Category
                    </Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(v) =>
                        setFormData({ ...formData, categoryId: v })
                      }
                    >
                      <SelectTrigger className="h-12 border-black/10 rounded-lg bg-white text-black font-medium">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-black/10 text-black">
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-black/60">
                      Price (GHS)
                    </Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="h-12 border-black/10 rounded-lg bg-white text-black font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-black/60">
                      Stock
                    </Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock: parseInt(e.target.value),
                        })
                      }
                      className="h-12 border-black/10 rounded-lg bg-white text-black font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-black/60">
                    Description
                  </Label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full h-32 p-4 text-sm border border-black/10 rounded-lg bg-white text-black font-medium focus:outline-none focus:border-black/20 resize-none"
                    placeholder="Enter description..."
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-2">
                  <div className="flex flex-col items-start gap-2 p-3 bg-black/5 rounded-xl border border-black/5">
                    <div className="space-y-0.5">
                      <Label className="text-[10px] font-bold uppercase text-black/40">
                        Featured
                      </Label>
                      <p className="text-[9px] text-black/30">Show on home</p>
                    </div>
                    <Switch
                      checked={formData.isFeatured}
                      onCheckedChange={(val) =>
                        setFormData({ ...formData, isFeatured: val })
                      }
                      className="scale-90 data-[state=checked]:bg-primary data-[state=unchecked]:bg-black/30"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-2 p-3 bg-black/5 rounded-xl border border-black/5">
                    <div className="space-y-0.5">
                      <Label className="text-[10px] font-bold uppercase text-black/40">
                        New Arrival
                      </Label>
                      <p className="text-[9px] text-black/30">Recent product</p>
                    </div>
                    <Switch
                      checked={formData.isNewArrival}
                      onCheckedChange={(val) =>
                        setFormData({ ...formData, isNewArrival: val })
                      }
                      className="scale-90 data-[state=checked]:bg-primary data-[state=unchecked]:bg-black/30"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-2 p-3 bg-black/5 rounded-xl border border-black/5">
                    <div className="space-y-0.5">
                      <Label className="text-[10px] font-bold uppercase text-black/40">
                        Promotion
                      </Label>
                      <p className="text-[9px] text-black/30">
                        Active discount
                      </p>
                    </div>
                    <Switch
                      checked={formData.isPromotion}
                      onCheckedChange={(val) =>
                        setFormData({ ...formData, isPromotion: val })
                      }
                      className="scale-90 data-[state=checked]:bg-primary data-[state=unchecked]:bg-black/30"
                    />
                  </div>
                </div>

                {formData.isPromotion && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <Label className="text-xs font-bold text-black/60">
                      Discount Price (GHS)
                    </Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.discountPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountPrice: e.target.value,
                        })
                      }
                      className="h-12 border-primary/20 rounded-lg bg-white text-primary font-bold focus:border-primary/40"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-black/60">
                    Product Images
                  </Label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                    multiple
                  />
                  <div className="grid grid-cols-3 gap-3">
                    {formData.images.map((img, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-black/5 rounded-xl relative group overflow-hidden border border-black/5"
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                        <button
                          onClick={() => {
                            const imgToRemove = formData.images[i];
                            setFormData({
                              ...formData,
                              images: formData.images.filter(
                                (_, idx) => idx !== i
                              ),
                            });
                            setPendingUploads((prev: any[]) =>
                              prev.filter((p: any) => p.preview !== imgToRemove)
                            );
                          }}
                          className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-black/10 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-black/5 transition-all group"
                    >
                      <ImagePlus className="h-6 w-6 text-black/20 group-hover:text-primary transition-colors" />
                      <span className="text-[10px] font-bold text-black/40">
                        Upload
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-bold text-black/60">
                    Colors
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "#FF0000",
                      "#0000FF",
                      "#000000",
                      "#FFFFFF",
                      "#CCCCCC",
                      "#FFE4B5",
                      "#8B4513",
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          toggleSelection(formData.colors, color, (val) =>
                            setFormData({ ...formData, colors: val })
                          )
                        }
                        className={cn(
                          "h-8 w-8 rounded-full border-2 transition-all p-0.5",
                          formData.colors.includes(color)
                            ? "border-primary scale-110"
                            : "border-transparent opacity-60 hover:opacity-100"
                        )}
                      >
                        <div
                          className="w-full h-full rounded-full border border-black/10"
                          style={{ backgroundColor: color }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-bold text-black/60">
                    Sizes
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "36",
                      "37",
                      "38",
                      "39",
                      "40",
                      "41",
                      "42",
                      "43",
                      "44",
                      "45",
                    ].map((size) => (
                      <button
                        key={size}
                        onClick={() =>
                          toggleSelection(formData.sizes, size, (val) =>
                            setFormData({ ...formData, sizes: val })
                          )
                        }
                        className={cn(
                          "h-10 w-10 rounded-lg font-bold text-xs transition-all flex items-center justify-center",
                          formData.sizes.includes(size)
                            ? "bg-primary text-white"
                            : "bg-black/5 text-black/40 hover:bg-black/10"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  closeAddProduct();
                  setEditingProduct(null);
                }}
                className="h-14 border-black/10 rounded-lg text-white hover:text-black font-bold hover:bg-black/5"
              >
                Cancel
              </Button>
              <Button
                className="h-14 bg-primary hover:bg-primary/90 text-white font-semibold tracking-widest rounded-lg transition-all active:scale-[0.98] text-sm md:text-base"
                onClick={handleSaveProduct}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : editingProduct
                  ? "Update Product"
                  : "Add Product"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        itemName={productToDelete?.name || ""}
      />
    </div>
  );
}
