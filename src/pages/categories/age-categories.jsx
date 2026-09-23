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
    <div className="category-page">
      <PageNavigation
        title={pageTitle}
        description="Create and manage game categories for this age group."
        items={[
          { label: "Categories & Levels", to: "/categories" },
          { label: ageGroup?.name || "Age Group" },
        ]}
        action={
          <button className="primary-btn" type="button" onClick={openCreateDialog} disabled={!ageGroupId}>
            <Plus size={18} /> Add Category
          </button>
        }
      />

      {loading ? (
        <div className="catalog-status-card" role="status" aria-live="polite">
          <div className="catalog-spinner" />
          <h3>Loading categories...</h3>
          <p>Preparing this age group for you.</p>
        </div>
      ) : error ? (
        <div className="catalog-status-card catalog-status-card--error" role="alert">
          <h3>Categories could not be displayed</h3>
          <p>{error}</p>
          <button className="primary-btn" type="button" onClick={loadPage}>Try again</button>
        </div>
      ) : categories.length === 0 ? (
        <CatalogEmptyState
          title="No categories in this age group yet"
          message="Create the first game category to start adding levels and questions."
          actionLabel="Add Category"
          onAction={openCreateDialog}
        />
      ) : (
        <div className="table-responsive">
          <table className="catalog-table">
            <thead>
              <tr>
                <th>Card</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <div className="catalog-table-card">
                      <img src={category.image_url} alt="" />
                      <div>
                        <strong>{category.name}</strong>
                        {category.description ? <p>{category.description}</p> : null}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button type="button" onClick={() => openEditDialog(category)}>
                        <Pencil size={17} /> Edit
                      </button>
                      <button className="danger" type="button" onClick={() => setDeleteTarget(category)}>
                        <Trash2 size={17} /> Delete
                      </button>
                      <button
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
      )}

      <FormDialog
        open={dialogOpen}
        title={editingCategory ? "Edit Category" : "Add Category"}
        onClose={closeDialog}
      >
        <form onSubmit={saveCategory}>
          <label htmlFor="category-name">Card title *</label>
          <input
            id="category-name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Enter category title"
            required
          />

          <label htmlFor="category-description">Description (optional)</label>
          <textarea
            id="category-description"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Describe this category"
          />

          <ImageUploadField
            label="Card image"
            required
            file={form.image}
            currentUrl={form.imageUrl}
            onChange={(image) => setForm((current) => ({ ...current, image }))}
          />

          <button className="dialog-save-btn" type="submit" disabled={saving}>
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
