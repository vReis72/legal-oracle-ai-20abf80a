
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, LucideIcon } from 'lucide-react';

interface DocumentSectionProps {
  title: string;
  icon: LucideIcon;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const DocumentSection: React.FC<DocumentSectionProps> = ({ 
  title, 
  icon: Icon, 
  expanded, 
  onToggle, 
  children 
}) => {
  return (
    <Card>
      <CardHeader 
        className={cn(
          "pb-2 cursor-pointer",
          expanded ? "" : "pb-0"
        )}
        onClick={onToggle}
      >
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Icon className="h-5 w-5 mr-2" />
            {title}
          </CardTitle>
          {expanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          {children}
        </CardContent>
      )}
    </Card>
  );
};

export default DocumentSection;
