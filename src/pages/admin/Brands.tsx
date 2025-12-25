import { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  Search,
  X,
  FileUp,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStatus } from "@/components/StatusOverlay";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";
import { useBrands } from "@/hooks/useBrands";
import { dataService } from "@/lib/dataService";
import { uploadImage } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LoadingScreen from "@/components/LoadingScreen";

export default function AdminBrands() {
  const { brands, isLoading, mutate } = useBrands();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [brandToDelete, setBrandToDelete] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    defaultImage: "",
    promoPercentage: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [defaultImageFile, setDefaultImageFile] = useState<File | null>(null);
  const showStatus = useStatus((state) => state.showStatus);

  const filteredBrands = useMemo(() => {
    return brands.filter(
      (b) =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [brands, searchQuery]);

  const handleEdit = (brand: any) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      logoUrl: brand.logoUrl || "",
      defaultImage: brand.defaultImage || "",
      promoPercentage: brand.promoPercentage?.toString() || "",
    });
    setIsAddModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      showStatus("error", "Error", "Brand name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalLogoUrl = formData.logoUrl;
      let finalDefaultImage = formData.defaultImage;

      if (logoFile) {
        showStatus("loading", "Uploading...", "Uploading logo...");
        finalLogoUrl = await uploadImage(logoFile, "brands");
      }

      if (defaultImageFile) {
        showStatus(
          "loading",
          "Uploading...",
          "Uploading default product image..."
        );
        finalDefaultImage = await uploadImage(defaultImageFile, "products");
      }

      const brandData = {
        name: formData.name,
        logoUrl:
          finalLogoUrl ||
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        defaultImage: finalDefaultImage,
        promoPercentage: formData.promoPercentage
          ? parseInt(formData.promoPercentage)
          : null,
      };

      if (editingBrand) {
        await dataService.updateBrand(editingBrand.id, brandData);
        showStatus("success", "Updated", "Brand updated successfully");
      } else {
        await dataService.createBrand(brandData);
        showStatus("success", "Added", "Brand added successfully");
      }
      mutate();
      closeModal();
    } catch (error: any) {
      showStatus("error", "Error", error.message || "Failed to save brand");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!brandToDelete) return;
    try {
      await dataService.deleteBrand(brandToDelete.id);
      showStatus("success", "Deleted", "Brand removed");
      setBrandToDelete(null);
      mutate();
    } catch (error: any) {
      showStatus("error", "Error", error.message || "Failed to delete brand");
    }
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingBrand(null);
    setFormData({
      name: "",
      logoUrl: "",
      defaultImage: "",
      promoPercentage: "",
    });
    setLogoFile(null);
    setDefaultImageFile(null);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDefaultImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDefaultImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, defaultImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-4xl font-semibold text-black italic uppercase tracking-tighter">
          Brands
        </h1>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white font-semibold h-10 lg:h-11 px-4 lg:px-8 rounded-lg shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          <span className="inline">Add Brand</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/30" />
          <Input
            placeholder="Search brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-black/5 border-none h-12 rounded-xl text-black placeholder:text-black/30 w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBrands.map((brand) => (
          <div
            key={brand.id}
            className="bg-[#2A2A2A] rounded-2xl overflow-hidden group hover:ring-2 hover:ring-primary transition-all shadow-xl relative aspect-video"
          >
            <div className="absolute top-6 left-6 z-10">
              <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-lg border border-white/5">
                <span className="text-[10px] font-semibold text-white uppercase tracking-widest">
                  {brand.name}
                </span>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-white/40 hover:text-white transition-colors">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-[#1A1A1A] border-white/10 text-white"
                >
                  <DropdownMenuItem
                    onClick={() => handleEdit(brand)}
                    className="hover:bg-white/5 cursor-pointer"
                  >
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setBrandToDelete(brand)}
                    className="text-red-500 hover:bg-red-500/10 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="w-full h-full flex items-start justify-start py-12 px-6 mt-8">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-1 shadow-2xl">
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Tag className="h-full w-full text-black/10" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={isAddModalOpen}
        onOpenChange={(val) => !val && closeModal()}
        // modal={false}
      >
        <DialogContent
          className="bg-white border-none max-w-[500px] p-0 overflow-hidden rounded-[20px]"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Add Brand</DialogTitle>
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-semibold text-black tracking-tight">
                {editingBrand ? "Edit Brand" : "Add Brand"}
              </h2>
              <button
                onClick={closeModal}
                className="h-8 w-8 rounded-full border border-red-500 flex items-center justify-center hover:bg-red-50 transition-all shadow-sm"
              >
                <X className="h-5 w-5 text-red-500" strokeWidth={3} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-black/60">
                  Brand Name
                </Label>
                <Input
                  placeholder="Enter brand name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="h-12 border-black/10 rounded-lg bg-white text-black font-medium focus-visible:border-black/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-black/60 uppercase">
                  Promo Percentage (%)
                </Label>
                <Input
                  type="number"
                  placeholder="e.g. 50"
                  value={formData.promoPercentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      promoPercentage: e.target.value,
                    })
                  }
                  className="h-12 border-black/10 rounded-lg bg-white text-black font-medium focus-visible:border-black/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-black/60 uppercase">
                    Brand Logo
                  </Label>
                  <input
                    type="file"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                    accept="image/*"
                  />
                  <div
                    onClick={() =>
                      document.getElementById("logo-upload")?.click()
                    }
                    className="border-2 border-dashed border-black/10 rounded-xl p-4 min-h-[120px] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-black/5 transition-all group"
                  >
                    {formData.logoUrl ? (
                      <div className="h-20 w-20 bg-black/5 rounded-lg p-1">
                        <img
                          src={formData.logoUrl}
                          alt="Logo Preview"
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : (
                      <>
                        <FileUp className="h-5 w-5 text-black/40 group-hover:text-primary transition-all" />
                        <span className="text-[10px] font-bold text-black/40 uppercase">
                          Logo
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-black/60 uppercase">
                    Brand Image
                  </Label>
                  <input
                    type="file"
                    onChange={handleDefaultImageUpload}
                    className="hidden"
                    id="default-image-upload"
                    accept="image/*"
                  />
                  <div
                    onClick={() =>
                      document.getElementById("default-image-upload")?.click()
                    }
                    className="border-2 border-dashed border-black/10 rounded-xl p-4 min-h-[120px] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-black/5 transition-all group"
                  >
                    {formData.defaultImage ? (
                      <div className="h-20 w-20 bg-black/5 rounded-lg p-1">
                        <img
                          src={formData.defaultImage}
                          alt="Default Image Preview"
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : (
                      <>
                        <FileUp className="h-5 w-5 text-black/40 group-hover:text-primary transition-all" />
                        <span className="text-[10px] font-bold text-black/40 uppercase">
                          Product
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                variant="outline"
                onClick={closeModal}
                className="h-12 border-black/10 rounded-lg text-white hover:text-black font-semibold hover:bg-black/5"
              >
                Cancel
              </Button>
              <Button
                className="h-12 bg-primary hover:bg-primary/90 text-white font-semibold uppercase tracking-widest rounded-lg transition-all active:scale-[0.98]"
                onClick={handleSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : editingBrand ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        isOpen={!!brandToDelete}
        onClose={() => setBrandToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Brand"
        itemName={brandToDelete?.name || ""}
      />
    </div>
  );
}
