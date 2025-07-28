import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
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
              className="w-20 h-20 bg-muted rounded-lg border flex items-center justify-center text-muted-foreground text-xs"
              style={{ display: product.image_url ? "none" : "flex" }}
            >
              Yok
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-lg mb-2 line-clamp-2"
              title={product.name}
            >
              {product.name}
            </h3>
            <p className="text-primary font-bold text-lg mb-2">
              {product.price || "Fiyat yok"}
            </p>
            <p className="text-muted-foreground text-sm uppercase font-medium">
              {product.site}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenProduct}
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ürüne Git
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default ProductCard;
