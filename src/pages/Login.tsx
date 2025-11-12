"use client";

import React, { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserRound, ShieldCheck, Mail, Lock, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlobalHeader } from "@/components/layouts/PublicLayout/GlobalHeader";

type LoginType = "user" | "admin";

export const Login = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithPassword, loading: authLoading } = useAuth();
  const { t } = useTranslation('auth');

  // Determine login type from query params or default to user
  const params = new URLSearchParams(location.search);
  const loginType: LoginType = (params.get("type") as LoginType) || "user";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email || !password) {
        const errorMsg = t('login.errors.requiredFields', 'Vennligst fyll ut både e-post og passord');
        setError(errorMsg);
        setLoading(false);
        return;
      }

      await signInWithPassword(email, password);

      const successMsg = t('login.success.loggedIn', 'Innlogget! Videresender...');
      toast.success(successMsg);

      // Redirect based on login type
      if (loginType === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);

      let errorMessage = t('login.errors.loginFailed', 'Innlogging feilet. Sjekk e-post og passord.');

      if (err instanceof Error) {
        if (err.message?.includes("Invalid login credentials")) {
          errorMessage = t('login.errors.invalidCredentials', 'Ugyldig e-post eller passord');
        } else if (err.message?.includes("Email not confirmed")) {
          errorMessage = t('login.errors.emailNotConfirmed', 'E-postadressen er ikke bekreftet');
        }
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [email, password, loginType, signInWithPassword, navigate, t]);

  const isAdmin = loginType === "admin";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <GlobalHeader />

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className={`pb-8 pt-8 ${isAdmin ? "bg-gradient-to-r from-indigo-600 to-indigo-700" : "bg-gradient-to-r from-slate-600 to-slate-700"} text-white`}>
            <CardTitle className="flex items-center text-2xl font-bold">
              {isAdmin ? (
                <>
                  <ShieldCheck className="h-8 w-8 mr-3" />
                  {t('login.admin.title', 'Administrator Innlogging')}
                </>
              ) : (
                <>
                  <UserRound className="h-8 w-8 mr-3" />
                  {t('login.user.title', 'Bruker Innlogging')}
                </>
              )}
            </CardTitle>
            <CardDescription className={`text-lg ${isAdmin ? "text-indigo-100" : "text-slate-100"}`}>
              {isAdmin
                ? t('login.admin.subtitle', 'Logg inn med e-post og passord')
                : t('login.user.subtitle', 'Logg inn med e-post og passord')}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium text-gray-700">
                  {t('login.form.emailLabel', 'E-postadresse')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('login.form.emailPlaceholder', 'din.epost@example.com')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 text-base"
                    disabled={loading || authLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium text-gray-700">
                  {t('login.form.passwordLabel', 'Passord')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('login.form.passwordPlaceholder', '••••••••')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 text-base"
                    disabled={loading || authLoading}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className={`w-full h-12 text-lg font-semibold ${
                  isAdmin
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-slate-600 hover:bg-slate-700"
                } transition-colors`}
                disabled={loading || authLoading}
              >
                {loading || authLoading
                  ? t('login.form.submittingButton', 'Logger inn...')
                  : t('login.form.submitButton', 'Logg inn')}
              </Button>

              {/* Test credentials hint */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3 font-medium">
                  {t('login.testAccounts.title', 'Test-kontoer:')}
                </p>
                <div className="space-y-2 text-xs text-gray-600">
                  <p>• test.user@drammen.kommune.no</p>
                  <p>• staff@drammen.kommune.no</p>
                  <p>• admin@drammen.kommune.no</p>
                  <p>• owner@drammen.kommune.no</p>
                  <p>• superadmin@booknor.no</p>
                  <p className="mt-2 text-gray-500">
                    {t('login.testAccounts.password', 'Passord: password123')}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-gray-600 hover:text-gray-900"
                  onClick={() => navigate("/login-selection")}
                >
                  {t('login.form.backButton', 'Tilbake til innloggingsvalg')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
