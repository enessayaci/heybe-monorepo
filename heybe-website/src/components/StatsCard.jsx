import React from "react";
import { Card, CardContent } from "@/components/ui/card";

function StatsCard({ title, value, icon }) {
  return (
    <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              {typeof icon === "string" ? (
                <span className="text-lg">{icon}</span>
              ) : (
                <icon className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-lg font-bold text-gray-900">{value}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default StatsCard;
