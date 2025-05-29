
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  templateCount: number;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  templateCount
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filtrar por Especialidade</h3>
        {selectedCategory && (
          <Badge variant="outline" className="text-xs">
            {templateCount} modelo{templateCount !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>
      
      <Select
        value={selectedCategory || "todos"}
        onValueChange={(value) => onCategorySelect(value === "todos" ? null : value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione uma especialidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todas as Especialidades</SelectItem>
          {categories.map(category => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategoryFilter;
