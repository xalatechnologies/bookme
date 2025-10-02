"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface FacilityDetailBreadcrumbProps {
  readonly facilityName: string;
}

export const FacilityDetailBreadcrumb = ({ facilityName }: FacilityDetailBreadcrumbProps): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <nav className="flex items-center space-x-2 text-sm">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-600 hover:text-gray-900 p-0 h-auto font-normal" 
            onClick={() => navigate("/")}
          >
            <Home className="h-4 w-4 mr-1" />
            Hjem
          </Button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{facilityName}</span>
        </nav>
      </div>
    </div>
  );
};