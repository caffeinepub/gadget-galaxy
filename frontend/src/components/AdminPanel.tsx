import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Package, AlertCircle, Loader2, ShieldAlert } from 'lucide-react';
import { useGetAllProducts, useAddProduct, useUpdateProduct, useDeleteProduct, useIsCallerAdmin, useIsStripeConfigured } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { Product } from '../backend';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const CATEGORIES = [
  'Audio', 'Wearables', 'Accessories', 'Smart Home', 'Gaming',
  'Tablets', 'Cameras', 'Laptops', 'Phones', 'Networking',
];

interface ProductFormData {
  id: string;
  name: string;
  description: string;
  price: string; // in dollars, e.g. "29.99"
  currency: string;
  category: string;
  imageUrl: string;
  stock: string;
}

const emptyForm = (): ProductFormData => ({
  id: '',
  name: '',
  description: '',
  price: '',
  currency: 'USD',
  category: 'Audio',
  imageUrl: '',
  stock: '',
});

function productToForm(p: Product): ProductFormData {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: (Number(p.price) / 100).toFixed(2),
    currency: p.currency,
    category: p.category,
    imageUrl: p.imageUrl,
    stock: String(Number(p.stock)),
  };
}

function formToProduct(f: ProductFormData): Product {
  return {
    id: f.id.trim(),
    name: f.name.trim(),
    description: f.description.trim(),
    price: BigInt(Math.round(parseFloat(f.price) * 100)),
    currency: f.currency.trim() || 'USD',
    category: f.category,
    imageUrl: f.imageUrl.trim(),
    stock: BigInt(parseInt(f.stock, 10) || 0),
  };
}

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  editProduct: Product | null;
}

function ProductFormDialog({ open, onClose, editProduct }: ProductFormDialogProps) {
  const isEdit = !!editProduct;
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();

  const [form, setForm] = useState<ProductFormData>(() =>
    editProduct ? productToForm(editProduct) : emptyForm()
  );
  const [error, setError] = useState<string | null>(null);

  // Reset form whenever the dialog opens or the editProduct changes
  useEffect(() => {
    if (open) {
      setForm(editProduct ? productToForm(editProduct) : emptyForm());
      setError(null);
    }
  }, [open, editProduct]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  const set = (field: keyof ProductFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const validate = (): string | null => {
    if (!form.id.trim()) return 'Product ID is required.';
    if (!form.name.trim()) return 'Product name is required.';
    if (!form.description.trim()) return 'Description is required.';
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) return 'Price must be a valid non-negative number.';
    const stock = parseInt(form.stock, 10);
    if (isNaN(stock) || stock < 0) return 'Stock must be a valid non-negative integer.';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }

    try {
      const product = formToProduct(form);
      if (isEdit) {
        await updateProduct.mutateAsync(product);
      } else {
        await addProduct.mutateAsync(product);
      }
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'An error occurred. Please try again.';
      setError(msg.replace(/^Error: /, ''));
    }
  };

  const isPending = addProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the product details below.' : 'Fill in the details to add a new product to the catalog.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* ID */}
          <div className="space-y-1.5">
            <Label htmlFor="prod-id">Product ID <span className="text-red-500">*</span></Label>
            <Input
              id="prod-id"
              placeholder="e.g. prod-001"
              value={form.id}
              onChange={set('id')}
              disabled={isEdit}
              className={isEdit ? 'bg-gray-50 text-gray-500' : ''}
            />
            {isEdit && <p className="text-xs text-gray-400">Product ID cannot be changed after creation.</p>}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="prod-name">Name <span className="text-red-500">*</span></Label>
            <Input
              id="prod-name"
              placeholder="Product name"
              value={form.name}
              onChange={set('name')}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="prod-desc">Description <span className="text-red-500">*</span></Label>
            <textarea
              id="prod-desc"
              placeholder="Product description"
              value={form.description}
              onChange={set('description')}
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="prod-price">Price (USD) <span className="text-red-500">*</span></Label>
              <Input
                id="prod-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={set('price')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prod-stock">Stock <span className="text-red-500">*</span></Label>
              <Input
                id="prod-stock"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={form.stock}
                onChange={set('stock')}
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="prod-category">Category</Label>
            <select
              id="prod-category"
              value={form.category}
              onChange={set('category')}
              className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <Label htmlFor="prod-image">Image URL</Label>
            <Input
              id="prod-image"
              placeholder="https://example.com/image.jpg"
              value={form.imageUrl}
              onChange={set('imageUrl')}
            />
            {form.imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden border border-gray-100 h-24 bg-gray-50">
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending} className="bg-teal hover:bg-teal-dark text-white">
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEdit ? 'Saving…' : 'Adding…'}
              </>
            ) : (
              isEdit ? 'Save Changes' : 'Add Product'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: products = [], isLoading: productsLoading, isError } = useGetAllProducts();
  const { data: isStripeConfigured } = useIsStripeConfigured();
  const deleteProduct = useDeleteProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

  const isAuthenticated = !!identity;

  // Access guard
  if (!isAuthenticated || adminLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-teal mx-auto" />
          <p className="text-gray-500 text-sm">Checking permissions…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="bg-red-50 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-500 text-sm">
            You don't have permission to access the Admin Panel. Only administrators can manage products.
          </p>
          <Button variant="outline" onClick={onBack}>
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEditProduct(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditProduct(product);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditProduct(null);
  };

  const handleDeleteClick = (product: Product) => {
    setDeleteTarget(product);
    setDeleteError(null);
    setDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      setDeleteAlertOpen(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to delete product.';
      setDeleteError(msg.replace(/^Error: /, ''));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteAlertOpen(false);
    setDeleteTarget(null);
    setDeleteError(null);
  };

  return (
    <section className="py-10 bg-page min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-6 h-6 text-teal" />
              <h1 className="text-2xl font-extrabold text-gray-900">Product Management</h1>
            </div>
            <p className="text-gray-500 text-sm">Add, edit, or remove products from the catalog.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onBack} size="sm">
              ← Back to Shop
            </Button>
            <Button
              onClick={handleOpenAdd}
              className="bg-teal hover:bg-teal-dark text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Stripe status banner */}
        {!isStripeConfigured && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Stripe payments not configured</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Use the "Setup Payments" button in the bottom-right corner to enable Stripe checkout for your customers.
              </p>
            </div>
          </div>
        )}

        {/* Delete error */}
        {deleteError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{deleteError}</p>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {productsLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-10 text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-500 font-medium">Failed to load products.</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-16 text-center">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No products yet.</p>
              <p className="text-gray-400 text-sm mt-1">Click "Add Product" to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Price</TableHead>
                  <TableHead className="hidden md:table-cell">Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                        <img
                          src={product.imageUrl || '/assets/generated/speaker-product.dim_400x400.png'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/generated/speaker-product.dim_400x400.png';
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{product.id}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-xs font-medium text-teal bg-teal/10 px-2 py-0.5 rounded-full">
                        {product.category}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-semibold text-gray-900">
                      ${(Number(product.price) / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className={`text-sm font-medium ${Number(product.stock) === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                        {String(Number(product.stock))}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-teal hover:bg-teal/10"
                          onClick={() => handleOpenEdit(product)}
                          title="Edit product"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleDeleteClick(product)}
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Product form dialog */}
      <ProductFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        editProduct={editProduct}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">"{deleteTarget?.name}"</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting…
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
