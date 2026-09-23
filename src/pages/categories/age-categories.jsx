import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import axios from "axios";
import PageNavigation from "../../components/page-navigation";
import ConfirmDialog from "../../components/confirm-dialog";
import FormDialog from "../../components/form-dialog";
import ImageUploadField from "../../components/image-upload-field";
import CatalogEmptyState from "../../components/catalog-empty-state";
import {
  removeCatalogImage,
  uploadCatalogImage,
} from "../../data/media";

const emptyForm = {
  name: "",
  description: "",
  image: null,
  imageUrl: "",
};

const AgeCategories = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ageGroupId = searchParams.get("ageGroup");

  const [ageGroup, setAgeGroup] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadPage = useCallback(async () => {
    if (!ageGroupId) {
      setError("No age group was selected.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [ageGroupsResponse, categoriesResponse] = await Promise.all([
        axios.get("/admin/catalog/age-groups"),
        axios.get(`/admin/catalog/age-groups/${ageGroupId}/categories`),
      ]);

      const ageGroups = ageGroupsResponse?.data?.ageGroups || [];
      const categoryItems = categoriesResponse?.data?.categories || [];

      setAgeGroup(ageGroups.find((item) => String(item.id) === String(ageGroupId)) || null);
      setCategories(categoryItems);
    } catch (requestError) {
      console.error("Unable to load age categories", requestError);
      setError(
        requestError?.response?.data?.message ||
          "We could not load the categories for this age group. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [ageGroupId]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const pageTitle = useMemo(
    () => (ageGroup?.name ? `${ageGroup.name} Categories` : "Age Group Categories"),
    [ageGroup],
  );

  const openCreateDialog = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (category) => {
    setEditingCategory(category);
    setForm({
      name: category?.name || "",
      description: category?.description || "",
      image: null,
      imageUrl: category?.image_url || "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;
    setDialogOpen(false);
    setEditingCategory(null);
    setForm(emptyForm);
  };

  const saveCategory = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Card title is required.");
      return;
    }

    if (!form.image && !form.imageUrl) {
      toast.error("Card image is required.");
      return;
    }

    setSaving(true);
    let uploadedImageUrl = form.imageUrl;

    try {
      if (form.image) uploadedImageUrl = await uploadCatalogImage(form.image);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        imageUrl: uploadedImageUrl,
        ageGroupId,
      };

      if (editingCategory) {
        await axios.put(`/admin/catalog/categories/${editingCategory.id}`, payload);
        if (form.image && editingCategory.image_url !== uploadedImageUrl) {
          await removeCatalogImage(editingCategory.image_url);
        }
        toast.success("Category updated successfully.");
      } else {
        await axios.post("/admin/catalog/categories", payload);
        toast.success("Category created successfully.");
      }

      setDialogOpen(false);
      setEditingCategory(null);
      setForm(emptyForm);
      await loadPage();
    } catch (requestError) {
      if (form.image && uploadedImageUrl && uploadedImageUrl !== form.imageUrl) {
        await removeCatalogImage(uploadedImageUrl);
      }
      toast.error(requestError?.response?.data?.message || "Unable to save category.");
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await axios.delete(`/admin/catalog/categories/${deleteTarget.id}`);
      await removeCatalogImage(deleteTarget.image_url);
      setCategories((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Category deleted successfully.");
    } catch (requestError) {
      toast.error(requestError?.response?.data?.message || "Unable to delete category.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6">
      <PageNavigation
        title={pageTitle}
        description="Create and manage game categories for this age group."
        items={[
          { label: "Categories & Levels", to: "/categories" },
          { label: ageGroup?.name || "Age Group" },
        ]}
        action={
          <button className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={openCreateDialog} disabled={!ageGroupId}>
            <Plus size={18} /> Add Category
          </button>
        }
      />

      {loading ? (
        <div className="grid min-h-72 place-items-center rounded-2xl border bg-white p-8 text-center shadow-sm" role="status" aria-live="polite">
          <div><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" />
          <h3 className="mt-4 text-lg font-bold text-slate-900">Loading categories...</h3>
          <p className="mt-1 text-sm text-slate-500">Preparing this age group for you.</p></div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center" role="alert">
          <h3 className="text-lg font-bold text-red-800">Categories could not be displayed</h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button className="mt-5 rounded-xl bg-purple-600 px-5 py-3 font-bold text-white" type="button" onClick={loadPage}>Try again</button>
        </div>
      ) : categories.length === 0 ? (
        <CatalogEmptyState
          title="No categories in this age group yet"
          message="Create the first game category to start adding levels and questions."
          actionLabel="Add Category"
          onAction={openCreateDialog}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] table-fixed text-left">
            <thead className="bg-slate-50 text-sm text-slate-600">
              <tr>
                <th className="w-2/3 px-6 py-4 font-bold">Card</th>
                <th className="w-1/3 px-6 py-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {categories.map((category) => (
                <tr key={category.id} className="transition hover:bg-slate-50/70">
                  <td className="px-6 py-4 align-middle">
                    <div className="flex min-w-0 items-center gap-4">
                      <img className="h-16 w-24 shrink-0 rounded-xl border border-slate-100 object-cover" src={category.image_url} alt="" />
                      <div className="min-w-0">
                        <strong className="block truncate text-base text-slate-900">{category.name}</strong>
                        {category.description ? <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">{category.description}</p> : <p className="mt-1 text-sm text-slate-400">No description</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="flex flex-wrap justify-end gap-3 text-sm font-semibold">
                      <button className="flex items-center gap-1 text-purple-600 hover:text-purple-800" type="button" onClick={() => openEditDialog(category)}>
                        <Pencil size={17} /> Edit
                      </button>
                      <button className="flex items-center gap-1 text-red-500 hover:text-red-700" type="button" onClick={() => setDeleteTarget(category)}>
                        <Trash2 size={17} /> Delete
                      </button>
                      <button
                        className="flex items-center gap-1 text-slate-700 hover:text-purple-700"
                        type="button"
                        onClick={() => navigate(`/categories/view-categories?ageGroup=${ageGroupId}&category=${category.id}`)}
                      >
                        <Eye size={17} /> Open
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <FormDialog
        open={dialogOpen}
        title={editingCategory ? "Edit Category" : "Add Category"}
        onClose={closeDialog}
      >
        <form onSubmit={saveCategory} className="space-y-5">
          <label className="block text-sm font-semibold text-slate-700" htmlFor="category-name">Card title *
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            id="category-name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Enter category title"
            required
          />
          </label>

          <label className="block text-sm font-semibold text-slate-700" htmlFor="category-description">Description <span className="font-normal text-slate-400">(optional)</span>
          <textarea
            className="mt-2 min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            id="category-description"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Describe this category"
          />
          </label>

          <ImageUploadField
            label="Card image"
            required
            file={form.image}
            currentUrl={form.imageUrl}
            onChange={(image) => setForm((current) => ({ ...current, image }))}
          />

          <button className="w-full rounded-xl bg-purple-600 py-3 font-bold text-white transition hover:bg-purple-700 disabled:cursor-wait disabled:opacity-60" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      </FormDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete category?"
        message={`Delete ${deleteTarget?.name || "this category"}? Its related levels and questions may also be removed.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        onCancel={() => !deleting && setDeleteTarget(null)}
        onConfirm={deleteCategory}
        loading={deleting}
      />
    </div>
  );
};

export default AgeCategories;
