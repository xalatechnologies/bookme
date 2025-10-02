"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { UserRound, ShieldCheck } from "lucide-react";

import { useTranslation } from "@/i18n";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlobalHeader } from "@/components/GlobalHeader";

export const LoginSelection = (): JSX.Element => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleUserSelection = (userType: "admin" | "user"): void => {
    if (userType === "admin") {
      navigate("/admin");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <GlobalHeader />

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Velkommen til BookMe Portal
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Velg hvordan du vil logge inn på systemet for å få tilgang til våre tjenester
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Bruker Card */}
            <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-lg bg-white">
              <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white pb-8 pt-8">
                <CardTitle className="flex items-center text-2xl font-bold text-left">
                  <UserRound className="h-8 w-8 mr-3" />
                  Bruker
                </CardTitle>
                <CardDescription className="text-slate-100 text-lg text-left">
                  For publikum og aktører
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between pt-8 px-8">
                <div>
                  <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                    Logg inn for å reservere lokaler, administrere dine bookinger og mer.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="font-semibold mb-3 text-gray-900 text-lg">Innloggingsmetoder:</p>
                    <div className="space-y-2">
                      <p className="text-gray-700 text-base">• BankID</p>
                      <p className="text-gray-700 text-base">• Vipps</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-8 pb-8">
                <Button 
                  className="w-full h-12 text-lg font-semibold bg-slate-600 hover:bg-slate-700 transition-colors" 
                  onClick={() => handleUserSelection("user")}
                >
                  Fortsett som bruker
                </Button>
              </CardFooter>
            </Card>

            {/* Administrator Card */}
            <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-lg bg-white">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white pb-8 pt-8">
                <CardTitle className="flex items-center text-2xl font-bold text-left">
                  <ShieldCheck className="h-8 w-8 mr-3" />
                  Administrator
                </CardTitle>
                <CardDescription className="text-indigo-100 text-lg text-left">
                  For systemadministratorer og ledelse
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between pt-8 px-8">
                <div>
                  <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                    Logg inn for å administrere systemet, godkjenne bookinger, og se statistikk.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="font-semibold mb-3 text-gray-900 text-lg">Innloggingsmetoder:</p>
                    <div className="space-y-2">
                      <p className="text-gray-700 text-base">• SSO (Single Sign-On)</p>
                      <p className="text-gray-700 text-base">• BankID</p>
                      <p className="text-gray-700 text-base">• Vipps</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-8 pb-8">
                <Button 
                  className="w-full h-12 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 transition-colors" 
                  onClick={() => handleUserSelection("admin")}
                >
                  Fortsett som administrator
                </Button>
              </CardFooter>
            </Card>
          </div>


        </div>
      </div>
    </div>
  );
};
