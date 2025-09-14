import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TravelRequest } from "./TravelRequestForm";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Laptop, Smartphone } from "lucide-react";

interface Traveler {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status: 'confirmed' | 'pending' | 'declined';
}

interface TravelTableViewProps {
  requests: TravelRequest[];
  travelers: Record<string, Traveler[]>;
}

export function TravelTableView({ requests, travelers }: TravelTableViewProps) {
  const getStatusBadge = (status: TravelRequest['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">Brouillon</Badge>;
      case 'sent':
        return <Badge className="bg-orange-500 text-white hover:bg-orange-600">Envoyé</Badge>;
      case 'validated':
        return <Badge className="bg-green-600 text-white hover:bg-green-700">Validé</Badge>;
    }
  };

  const getPurposeLabel = (purpose: TravelRequest['purpose']) => {
    switch (purpose) {
      case 'salon': return 'Salon';
      case 'visite-client': return 'Visite client';
      case 'autres': return 'Autres';
    }
  };

  return (
    <div className="rounded-lg border bg-card shadow-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold text-foreground">Destination</TableHead>
            <TableHead className="font-semibold text-foreground">Dates</TableHead>
            <TableHead className="font-semibold text-foreground">Participants</TableHead>
            <TableHead className="font-semibold text-foreground">Objets</TableHead>
            <TableHead className="font-semibold text-foreground">Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id} className="hover:bg-muted/30">
              <TableCell>
                <div>
                  <div className="font-medium text-foreground">
                    {request.location.ville}, {request.location.pays}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getPurposeLabel(request.purpose)}
                  </div>
                </div>
              </TableCell>
              
              <TableCell className="text-sm">
                {request.dates.du && request.dates.au && (
                  <span>
                    {format(request.dates.du, "dd/MM", { locale: fr })} - {' '}
                    {format(request.dates.au, "dd/MM", { locale: fr })}
                  </span>
                )}
              </TableCell>
              
              <TableCell>
                <TooltipProvider>
                  <div className="flex gap-2">
                    {travelers[request.id]?.map((traveler) => (
                      <Tooltip key={traveler.id}>
                        <TooltipTrigger asChild>
                          <div className="relative">
                            <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-background hover:ring-accent transition-all">
                              <AvatarImage 
                                src={`https://i.pravatar.cc/100?u=${traveler.id}`} 
                                alt={traveler.name}
                              />
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {traveler.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            {/* Status indicator */}
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                              traveler.status === 'confirmed' ? 'bg-green-500' :
                              traveler.status === 'pending' ? 'bg-orange-500' : 'bg-red-500'
                            }`} />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-center">
                            <p className="font-medium">{traveler.name}</p>
                            <p className="text-xs text-muted-foreground">{traveler.role}</p>
                            <p className="text-xs">
                              {traveler.status === 'confirmed' ? 'Confirmé' :
                               traveler.status === 'pending' ? 'En attente' : 'Décliné'}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )) || (
                      <span className="text-sm text-muted-foreground">Aucun participant</span>
                    )}
                  </div>
                </TooltipProvider>
              </TableCell>
              
              <TableCell>
                <div className="flex gap-3">
                  {request.needs.ordinateurVoyage && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Laptop className="h-5 w-5 text-blue-600 cursor-pointer hover:text-blue-700" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ordinateur de voyage</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {request.needs.carteSIM && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Smartphone className="h-5 w-5 text-green-600 cursor-pointer hover:text-green-700" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Carte SIM</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                {getStatusBadge(request.status)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {requests.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Aucune demande de voyage</p>
        </div>
      )}
    </div>
  );
}