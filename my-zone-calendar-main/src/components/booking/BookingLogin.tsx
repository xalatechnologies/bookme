import { ArrowLeft, Building2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingLoginProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

export function BookingLogin({ onBack, onLoginSuccess }: BookingLoginProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-3">
              Logg inn for å fullføre
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-md mx-auto">
              For å sende din bookingforespørsel må du være innlogget. 
              Vi bruker sikker autentisering for å verifisere din identitet.
            </p>
          </div>

          {/* Login Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Vipps Card */}
            <button
              onClick={onLoginSuccess}
              className="bg-white rounded-xl p-6 text-left hover:shadow-lg transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-[#ff5b24] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Privatperson</h3>
                  <p className="text-xs text-slate-500">Anbefalt</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Rask og enkel innlogging med Vipps. Ingen passord nødvendig.
              </p>
              <div className="flex items-center justify-center bg-[#ff5b24] text-white py-3 px-6 rounded-full font-medium text-lg group-hover:bg-[#e54d1a] transition-colors tracking-wide">
                <span>Logg inn med V</span>
                <svg className="h-4 w-3 mx-px" viewBox="0 0 12 16" fill="currentColor">
                  <circle cx="6" cy="2.5" r="2" />
                  <path d="M2 8 Q6 14 10 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
                </svg>
                <span>pps</span>
              </div>
            </button>

            {/* Organization Card */}
            <button
              onClick={onLoginSuccess}
              className="bg-white rounded-xl p-6 text-left hover:shadow-lg transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Organisasjon</h3>
                  <p className="text-xs text-slate-500">For ansatte</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                For kommunalt ansatte og bedrifter med organisasjonskonto.
              </p>
              <div className="flex items-center justify-center gap-2 bg-slate-700 text-white py-2.5 px-4 rounded-lg font-medium group-hover:bg-slate-800 transition-colors">
                <Building2 className="w-4 h-4" />
                Logg inn som ansatt
              </div>
            </button>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-3 bg-slate-800/50 rounded-lg p-4">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Din informasjon behandles sikkert og i henhold til personvernlovgivningen. 
              Ved å logge inn godtar du at vi lagrer nødvendig informasjon for å behandle din booking.
            </p>
          </div>

          {/* Back Button */}
          <div className="mt-8 flex justify-start">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tilbake
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}