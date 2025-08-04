import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2 } from "lucide-react";

function ProductCard({ product, onDelete, onOpenProduct, isDeleting }) {
  const handleDelete = () => {
    if (confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      onDelete(product.id);
    }
  };

  const handleOpenProduct = () => {
    onOpenProduct(product);
  };

  return (
    <div className="bg-white rounded-lg border hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Thumbnail Card - WhatsApp tarzı */}
      <div className="flex p-4">
        {/* Ürün Resmi - Daha büyük */}
        <div className="flex-shrink-0 mr-4">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg border"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="w-20 h-20 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-400 text-xs"
            style={{ display: product.image_url ? "none" : "flex" }}
          >
            Yok
          </div>
        </div>

        {/* Ürün Bilgileri - WhatsApp tarzı */}
        <div className="flex-1 min-w-0">
          {/* Başlık - Bold ve büyük */}
          <h3
            className="font-bold text-gray-900 text-lg mb-1 line-clamp-2"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Fiyat - Varsa göster */}
          {product.price && (
            <p className="text-lg font-semibold text-green-600 mb-2">
              {product.price} ₺
            </p>
          )}

          {/* Site adı - Normal yazı */}
          <p className="text-xs text-gray-400 font-medium">{product.site}</p>
        </div>

        {/* Butonlar - Sağ tarafta yan yana */}
        <div className="flex-shrink-0 ml-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenProduct}
            className="w-20"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-20"
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
