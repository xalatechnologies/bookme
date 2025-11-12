"use client";

import React from "react";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const LoadingState: React.FC = (): JSX.Element => {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <h2 className="text-xl font-semibold text-gray-900">{t('loading.facility')}</h2>
        <p className="text-gray-600">{t('loading.please_wait')}</p>
      </div>
    </div>
  );
};

interface ErrorStateProps {
  readonly error?: string;
  readonly notFound?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, notFound = false }): JSX.Element => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const handleGoBack = (): void => {
    navigate(-1);
  };

  const handleGoHome = (): void => {
    navigate('/');
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">{t('messages.facility_not_found')}</h1>
              <p className="text-gray-600">
                {t('messages.facility_not_found_desc')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleGoBack}
                className="flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('actions.go_back')}
              </Button>
              <Button
                onClick={handleGoHome}
                className="flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" />
                {t('actions.go_home')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">{t('messages.error')}</h1>
            <p className="text-gray-600">
              {error || t('messages.loadingFailed', { item: t('facilities.count') })}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('actions.go_back')}
            </Button>
            <Button
              onClick={handleGoHome}
              className="flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" />
              {t('actions.go_home')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
