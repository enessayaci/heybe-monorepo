import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2 } from "lucide-react";

function ProductCard({ product, onDelete, onOpenProduct }) {
  const handleDelete = () => {
    if (confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      onDelete(product.id);
    }
  };

  const handleOpenProduct = () => {
    onOpenProduct(product.product_url);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border hover:shadow-md transition-all duration-200">
      {/* Ürün Resmi */}
      <div className="flex-shrink-0">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-16 h-16 object-cover rounded-lg border"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-400 text-xs"
          style={{ display: product.image_url ? "none" : "flex" }}
        >
          Yok
        </div>
      </div>

      {/* Ürün Bilgileri */}
      <div className="flex-1 min-w-0">
        <h3
          className="font-semibold text-gray-900 mb-1 line-clamp-1"
          title={product.name}
        >
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 uppercase font-medium">
          {product.site}
        </p>
      </div>

      {/* Butonlar */}
      <div className="flex gap-2 flex-shrink-0">
        <Button variant="outline" size="sm" onClick={handleOpenProduct}>
          <ExternalLink className="w-4 h-4 mr-1" />
          Git
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default ProductCard;
