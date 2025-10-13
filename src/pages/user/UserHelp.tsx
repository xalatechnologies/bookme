"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SupportTicketForm } from "@/components/support/SupportTicketForm";
import { 
  HelpCircle, 
  Search, 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText,
  ChevronDown,
  ChevronRight,
  Plus,
  Ticket
} from "lucide-react";

interface IFAQItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  readonly category: string;
}

const UserHelp = (): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [showSupportTicket, setShowSupportTicket] = useState<boolean>(false);

  const faqItems: readonly IFAQItem[] = [
    {
      id: "1",
      question: "Hvordan booker jeg et lokale?",
      answer: "Du kan booke et lokale ved å gå til 'Lokaler'-siden, velge ønsket lokale og klikke på 'Book nå'. Fyll ut skjemaet med ønsket dato og tid, og bekreft bookingen.",
      category: "Booking"
    },
    {
      id: "2",
      question: "Kan jeg endre eller avlyse en booking?",
      answer: "Ja, du kan endre eller avlyse dine bookinger fra 'Mine bookinger'-siden. Klikk på 'Rediger' eller 'Avlys' ved siden av den relevante bookingen.",
      category: "Booking"
    },
    {
      id: "3",
      question: "Hvilke betalingsmetoder aksepteres?",
      answer: "Vi aksepterer Vipps, kortbetaling og faktura. Betalingsmetoden velges under bookingprosessen.",
      category: "Betaling"
    },
    {
      id: "4",
      question: "Hvor lenge i forveien kan jeg booke?",
      answer: "Du kan booke opptil 3 måneder i forveien. Noen lokaler kan ha kortere bookingsfrist.",
      category: "Booking"
    },
    {
      id: "5",
      question: "Hva skjer hvis jeg ikke møter opp?",
      answer: "Hvis du ikke møter opp til en booking, kan det påvirke din mulighet til å booke i fremtiden. Vi anbefaler å avlyse i god tid hvis du ikke kan møte.",
      category: "Booking"
    },
    {
      id: "6",
      question: "Kan jeg få kvittering for mine bookinger?",
      answer: "Ja, du kan laste ned kvitteringer fra 'Mine bookinger'-siden. Klikk på 'Se detaljer' ved siden av bookingen og velg 'Last ned kvittering'.",
      category: "Kvittering"
    }
  ];

  const categories = ["Alle", "Booking", "Betaling", "Kvittering", "Teknisk"];

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const toggleFAQ = (id: string): void => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Hjelp og support
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Finn svar på vanlige spørsmål eller kontakt oss for hjelp
        </p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Phone className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Ring oss
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Man-fre: 08:00-16:00
            </p>
            <Button variant="outline" className="w-full">
              +47 123 45 678
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Mail className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Send e-post
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Vi svarer innen 24 timer
            </p>
            <Button variant="outline" className="w-full">
              support@bookme.no
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Chat support
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Man-fre: 09:00-15:00
            </p>
            <Button variant="outline" className="w-full">
              Start chat
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Ticket className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Support ticket
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Send en detaljert henvendelse
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowSupportTicket(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Opprett ticket
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Søk i hjelp og FAQ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Ofte stilte spørsmål
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <button
                    onClick={() => toggleFAQ(item.id)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.question}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {item.category}
                      </p>
                    </div>
                    {expandedFAQ === item.id ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedFAQ === item.id && (
                    <div className="px-4 pb-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Ingen resultater funnet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Prøv å søke med andre ord eller kontakt oss direkte.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Hurtiglenker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <FileText className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Bruksvilkår</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Les våre bruksvilkår
                </div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <FileText className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Personvernpolicy</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Hvordan vi behandler dine data
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Support Ticket Modal */}
      {showSupportTicket && (
        <SupportTicketForm
          isOpen={showSupportTicket}
          onClose={() => setShowSupportTicket(false)}
          onSubmit={(ticketData) => {
            // Handle support ticket creation
            setShowSupportTicket(false);
          }}
          userId="tenant-1"
          userName="Hamid Rahmani"
          userEmail="hamid.rahmani@example.com"
          userType="tenant"
        />
      )}
    </div>
  );
};

export default UserHelp;
