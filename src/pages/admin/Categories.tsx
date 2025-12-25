import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, LayoutGrid, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStatus } from "@/components/StatusOverlay";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks/useCategories";
import { dataService } from "@/lib/dataService";
import LoadingScreen from "@/components/LoadingScreen";

export default function AdminCategories() {
  const { categories, isLoading, mutate } = useCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", slug: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showStatus = useStatus((state) => state.showStatus);

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
    });
    setIsAddModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      showStatus("error", "Error", "Category name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const slug =
        formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-");
      const categoryData = {
        name: formData.name,
        slug: slug,
      };

      if (editingCategory) {
        await dataService.updateCategory(editingCategory.id, categoryData);
        showStatus("success", "Updated", "Category updated successfully");
      } else {
        await dataService.createCategory(categoryData);
        showStatus("success", "Added", "Category created successfully");
      }
      mutate();
      closeModal();
    } catch (error: any) {
      showStatus("error", "Error", error.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await dataService.deleteCategory(categoryToDelete.id);
      showStatus("success", "Deleted", "Category removed");
      setCategoryToDelete(null);
      mutate();
    } catch (error: any) {
      showStatus(
        "error",
        "Error",
        error.message || "Failed to delete category"
      );
    }
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", slug: "" });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-4xl font-semibold text-black italic uppercase tracking-tighter">
          Categories
        </h1>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white font-bold h-10 lg:h-11 px-4 lg:px-8 rounded-lg shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/30" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-black/5 border-none h-12 rounded-xl text-black placeholder:text-black/30 w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="bg-[#0D0D0D] rounded-3xl overflow-hidden group hover:ring-2 hover:ring-primary transition-all border border-white/10 shadow-xl"
          >
            <div className="h-40 bg-white/5 relative flex items-center justify-center overflow-hidden">
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                  <span className="text-[10px] font-semibold text-white uppercase tracking-widest">
                    {cat.name}
                  </span>
                </div>
              </div>

              {cat?.image ? (
                <img
                  src={cat?.image}
                  alt={cat.name}
                  className="h-full w-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="h-full w-full bg-white/10 flex items-center justify-center">
                  <LayoutGrid className="h-10 w-10 text-white/10" />
                </div>
              )}

              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />

              <div className="absolute top-4 right-4 flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(cat)}
                  className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all border border-white/10"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCategoryToDelete(cat)}
                  className="p-2.5 bg-red-500/80 backdrop-blur-md rounded-xl text-white hover:bg-red-600 transition-all border border-white/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between bg-white/3">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase text-white/20 tracking-widest">
                  URL SLUG
                </span>
                <span className="text-xs text-white/60 font-bold lowercase">
                  /{cat.slug}
                </span>
              </div>
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold italic"
              >
                ACTIVE
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={isAddModalOpen}
        onOpenChange={(val) => !val && closeModal()}
        modal={false}
      >
        <DialogContent
          className="bg-white border-none max-w-[500px] p-0 overflow-hidden rounded-[20px]"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Add Category</DialogTitle>
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-semibold text-black tracking-tight uppercase italic">
                {editingCategory ? "Edit Category" : "Add Category"}
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
                  Category Name
                </Label>
                <Input
                  placeholder="Enter text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="h-12 border-black/10 rounded-lg bg-white text-black font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-black/60">
                  Slug (URL path)
                </Label>
                <Input
                  placeholder="winter-collection"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="h-12 border-black/10 rounded-lg bg-white text-black font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                variant="outline"
                onClick={closeModal}
                className="h-12 border-black/10 rounded-lg text-white hover:text-black font-bold hover:bg-black/5"
              >
                Cancel
              </Button>
              <Button
                className="h-12 bg-primary hover:bg-primary/90 text-white font-semibold uppercase tracking-widest rounded-lg transition-all active:scale-[0.98]"
                onClick={handleSave}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : editingCategory
                  ? "Update"
                  : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        itemName={categoryToDelete?.name || ""}
      />
    </div>
  );
}
