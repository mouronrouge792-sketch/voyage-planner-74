import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, MapPin, Clock, Hotel, Smartphone, Laptop, Save, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export interface TravelRequest {
  id: string;
  purpose: 'salon' | 'visite-client' | 'autres';
  location: {
    quartier: string;
    ville: string;
    pays: string;
  };
  dates: {
    du: Date | null;
    au: Date | null;
  };
  arrival: {
    date: Date | null;
    time: string;
    preference: 'matin' | 'veille-soir' | 'les-deux';
    preciseTime: string;
  };
  departure: {
    date: Date | null;
    time: string;
    preference: 'soir' | 'lendemain' | 'les-deux';
    preciseTime: string;
  };
  hotel: {
    proche: string;
  };
  needs: {
    carteSIM: boolean;
    ordinateurVoyage: boolean;
  };
  status: 'draft' | 'sent' | 'validated';
  comments: Array<{
    id: string;
    author: string;
    text: string;
    date: Date;
  }>;
}

interface TravelRequestFormProps {
  request?: TravelRequest;
  onSave?: (request: TravelRequest) => void;
  onSend?: (request: TravelRequest) => void;
  onCancel?: () => void;
}

export function TravelRequestForm({ request, onSave, onSend, onCancel }: TravelRequestFormProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<TravelRequest>(
    request || {
      id: Date.now().toString(),
      purpose: 'salon',
      location: { quartier: '', ville: '', pays: '' },
      dates: { du: null, au: null },
      arrival: { date: null, time: '', preference: 'matin', preciseTime: '' },
      departure: { date: null, time: '', preference: 'soir', preciseTime: '' },
      hotel: { proche: '' },
      needs: { carteSIM: false, ordinateurVoyage: false },
      status: 'draft',
      comments: [],
    }
  );

  const handleSave = () => {
    onSave?.(formData);
    toast({
      title: "Brouillon sauvegardé",
      description: "Votre demande de voyage a été sauvegardée en brouillon."
    });
  };

  const handleSend = () => {
    const updatedRequest = { ...formData, status: 'sent' as const };
    onSend?.(updatedRequest);
    toast({
      title: "Demande envoyée",
      description: "Votre demande de voyage a été envoyée avec succès.",
      className: "bg-success text-success-foreground"
    });
  };

  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Nouvelle demande de voyage
          </h1>
          <p className="text-muted-foreground mt-2">
            Remplissez les informations nécessaires pour votre demande de déplacement
          </p>
        </div>
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Type de déplacement */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <MapPin className="h-5 w-5" />
            Type de déplacement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="purpose">Je vais être en</Label>
            <Select
              value={formData.purpose}
              onValueChange={(value) => updateFormData('purpose', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salon">Salon</SelectItem>
                <SelectItem value="visite-client">Visite client</SelectItem>
                <SelectItem value="autres">Autres</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quartier">Quartier</Label>
              <Input
                id="quartier"
                value={formData.location.quartier}
                onChange={(e) => updateFormData('location.quartier', e.target.value)}
                placeholder="Entrez le quartier"
              />
            </div>
            <div>
              <Label htmlFor="ville">Ville</Label>
              <Input
                id="ville"
                value={formData.location.ville}
                onChange={(e) => updateFormData('location.ville', e.target.value)}
                placeholder="Entrez la ville"
              />
            </div>
            <div>
              <Label htmlFor="pays">Pays</Label>
              <Input
                id="pays"
                value={formData.location.pays}
                onChange={(e) => updateFormData('location.pays', e.target.value)}
                placeholder="Entrez le pays"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dates */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CalendarIcon className="h-5 w-5" />
            Période de voyage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Du</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dates.du && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dates.du ? format(formData.dates.du, "PPP", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dates.du || undefined}
                    onSelect={(date) => updateFormData('dates.du', date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label>Au</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dates.au && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dates.au ? format(formData.dates.au, "PPP", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dates.au || undefined}
                    onSelect={(date) => updateFormData('dates.au', date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arrivée */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Clock className="h-5 w-5" />
            Détails d'arrivée
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Je dois être sur place le</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.arrival.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.arrival.date ? format(formData.arrival.date, "PPP", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.arrival.date || undefined}
                    onSelect={(date) => updateFormData('arrival.date', date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="arrival-time">À</Label>
              <Input
                id="arrival-time"
                type="time"
                value={formData.arrival.time}
                onChange={(e) => updateFormData('arrival.time', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label>Je veux y aller</Label>
            <Select
              value={formData.arrival.preference}
              onValueChange={(value) => updateFormData('arrival.preference', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="matin">Le matin</SelectItem>
                <SelectItem value="veille-soir">La veille au soir</SelectItem>
                <SelectItem value="les-deux">Les deux</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="precise-arrival">À heure précise</Label>
            <Input
              id="precise-arrival"
              type="time"
              value={formData.arrival.preciseTime}
              onChange={(e) => updateFormData('arrival.preciseTime', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Départ */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Clock className="h-5 w-5" />
            Détails de départ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Je finis le</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.departure.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.departure.date ? format(formData.departure.date, "PPP", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.departure.date || undefined}
                    onSelect={(date) => updateFormData('departure.date', date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="departure-time">À</Label>
              <Input
                id="departure-time"
                type="time"
                value={formData.departure.time}
                onChange={(e) => updateFormData('departure.time', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label>Je veux repartir</Label>
            <Select
              value={formData.departure.preference}
              onValueChange={(value) => updateFormData('departure.preference', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="soir">Le soir</SelectItem>
                <SelectItem value="lendemain">Le lendemain</SelectItem>
                <SelectItem value="les-deux">Les deux</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="precise-departure">À heure précise</Label>
            <Input
              id="precise-departure"
              type="time"
              value={formData.departure.preciseTime}
              onChange={(e) => updateFormData('departure.preciseTime', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Hébergement */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Hotel className="h-5 w-5" />
            Hébergement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="hotel-location">Je veux un hôtel proche de</Label>
            <Input
              id="hotel-location"
              value={formData.hotel.proche}
              onChange={(e) => updateFormData('hotel.proche', e.target.value)}
              placeholder="Entrez l'emplacement souhaité"
            />
          </div>
        </CardContent>
      </Card>

      {/* Besoins spéciaux */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-primary">Besoins spéciaux</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="carte-sim"
              checked={formData.needs.carteSIM}
              onCheckedChange={(checked) => updateFormData('needs.carteSIM', checked)}
            />
            <Label htmlFor="carte-sim" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              J'ai besoin d'une carte SIM
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ordinateur"
              checked={formData.needs.ordinateurVoyage}
              onCheckedChange={(checked) => updateFormData('needs.ordinateurVoyage', checked)}
            />
            <Label htmlFor="ordinateur" className="flex items-center gap-2">
              <Laptop className="h-4 w-4" />
              J'ai besoin d'un ordinateur de voyage
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end pt-6 border-t">
        <Button variant="outline" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Sauvegarder le brouillon
        </Button>
        <Button onClick={handleSend} className="bg-gradient-accent">
          <Send className="mr-2 h-4 w-4" />
          Envoyer la demande
        </Button>
      </div>
    </div>
  );
}