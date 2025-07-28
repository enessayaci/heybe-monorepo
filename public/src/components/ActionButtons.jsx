import React from "react";
import { Button } from "@/components/ui/button";
import { Bug, RefreshCw, TestTube, Trash2 } from "lucide-react";

function ActionButtons({ onDebug, onRefresh, onTest, onClearAll }) {
  return (
    <div className="flex gap-3 flex-wrap">
      <Button
        variant="outline"
        onClick={onDebug}
        className="flex items-center gap-2"
      >
        <Bug className="w-4 h-4" />
        Debug
      </Button>

      <Button
        variant="outline"
        onClick={onRefresh}
        className="flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Yenile
      </Button>

      <Button
        variant="outline"
        onClick={onTest}
        className="flex items-center gap-2"
      >
        <TestTube className="w-4 h-4" />
        Test
      </Button>

      <Button
        variant="destructive"
        onClick={onClearAll}
        className="flex items-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Tümünü Sil
      </Button>
    </div>
  );
}

export default ActionButtons;
