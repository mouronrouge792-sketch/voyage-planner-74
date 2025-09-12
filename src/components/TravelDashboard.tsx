import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TravelRequestForm, TravelRequest } from "./TravelRequestForm";
import { Plus, Calendar, MapPin, Clock, MessageCircle, Edit, Trash2, Send, Users, Paperclip, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export function TravelDashboard() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<TravelRequest | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Simulated data - in real app this would come from backend
  useEffect(() => {
    const mockRequests: TravelRequest[] = [
      {
        id: "1",
        purpose: "salon",
        location: { quartier: "La Défense", ville: "Paris", pays: "France" },
        dates: { du: new Date(2024, 2, 15), au: new Date(2024, 2, 18) },
        arrival: { date: new Date(2024, 2, 15), time: "09:00", preference: "matin", preciseTime: "08:30" },
        departure: { date: new Date(2024, 2, 18), time: "17:00", preference: "soir", preciseTime: "18:00" },
        hotel: { proche: "Centre de congrès" },
        needs: { carteSIM: true, ordinateurVoyage: false },
        status: "validated",
        comments: [
          { id: "1", author: "Intermédiaire", text: "Hôtel réservé au Marriott La Défense", date: new Date(2024, 1, 10) },
          { id: "2", author: "Vous", text: "Parfait, merci !", date: new Date(2024, 1, 11) }
        ]
      }
    ];
    setRequests(mockRequests);
  }, []);

  const handleSaveRequest = (request: TravelRequest) => {
    setRequests(prev => {
      const existing = prev.find(r => r.id === request.id);
      if (existing) {
        return prev.map(r => r.id === request.id ? request : r);
      } else {
        return [...prev, request];
      }
    });
  };

  const handleSendRequest = (request: TravelRequest) => {
    handleSaveRequest(request);
    setIsFormOpen(false);
    setSelectedRequest(null);
  };

  const handleDeleteRequest = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    toast({
      title: "Demande supprimée",
      description: "La demande de voyage a été supprimée avec succès."
    });
  };

  const handleAddComment = (requestId: string) => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now().toString(),
      author: "Vous",
      text: newComment,
      date: new Date()
    };

    setRequests(prev => prev.map(r => 
      r.id === requestId 
        ? { ...r, comments: [...r.comments, comment] }
        : r
    ));
    
    setNewComment("");
    toast({
      title: "Commentaire ajouté",
      description: "Votre commentaire a été ajouté avec succès."
    });
  };

  const getStatusBadge = (status: TravelRequest['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Brouillon</Badge>;
      case 'sent':
        return <Badge className="bg-accent text-accent-foreground">Envoyée</Badge>;
      case 'validated':
        return <Badge className="bg-success text-success-foreground">Validée</Badge>;
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
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Mes demandes de voyage
            </h1>
            <p className="text-muted-foreground mt-2">
              Gérez vos demandes de déplacement professionnel
            </p>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-accent shadow-glow hover:shadow-elegant transition-all duration-300">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle demande
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Formulaire de demande de voyage</DialogTitle>
              </DialogHeader>
              <TravelRequestForm
                request={selectedRequest || undefined}
                onSave={handleSaveRequest}
                onSend={handleSendRequest}
                onCancel={() => {
                  setIsFormOpen(false);
                  setSelectedRequest(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {requests.length === 0 ? (
            <Card className="shadow-card border-0 text-center py-12">
              <CardContent>
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune demande de voyage</h3>
                <p className="text-muted-foreground mb-4">
                  Commencez par créer votre première demande de voyage
                </p>
                <Button 
                  onClick={() => setIsFormOpen(true)}
                  className="bg-gradient-accent"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer une demande
                </Button>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className="shadow-card border-0 hover:shadow-elegant transition-all duration-300 animate-fade-in">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-primary">
                        {getPurposeLabel(request.purpose)} - {request.location.ville}
                      </CardTitle>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="flex gap-2">
                      {request.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsFormOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {request.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRequest(request.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span>{request.location.quartier}, {request.location.ville}, {request.location.pays}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-accent" />
                      <span>
                        {request.dates.du && format(request.dates.du, "dd/MM", { locale: fr })} - {' '}
                        {request.dates.au && format(request.dates.au, "dd/MM", { locale: fr })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-accent" />
                      <span>
                        Arrivée: {request.arrival.time} ({request.arrival.preference})
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-accent" />
                      <span>
                        Départ: {request.departure.time} ({request.departure.preference})
                      </span>
                    </div>
                  </div>

                  {(request.needs.carteSIM || request.needs.ordinateurVoyage) && (
                    <div className="flex flex-wrap gap-2">
                      {request.needs.carteSIM && (
                        <Badge variant="outline">Carte SIM</Badge>
                      )}
                      {request.needs.ordinateurVoyage && (
                        <Badge variant="outline">Ordinateur de voyage</Badge>
                      )}
                    </div>
                  )}

                  {/* Comments section */}
                  {request.comments.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Commentaires ({request.comments.length})
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {request.comments.map((comment) => (
                          <div key={comment.id} className="bg-muted p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-sm">{comment.author}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(comment.date, "dd/MM à HH:mm", { locale: fr })}
                              </span>
                            </div>
                            <p className="text-sm">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add comment for sent/validated requests */}
                  {request.status !== 'draft' && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Ajouter un commentaire..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1"
                          rows={2}
                        />
                        <Button 
                          onClick={() => handleAddComment(request.id)}
                          disabled={!newComment.trim()}
                          size="sm"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Action buttons for different statuses */}
                  <div className="flex gap-2 pt-4 border-t">
                    {request.status === 'sent' && (
                      <>
                        <Button variant="outline" size="sm">
                          <Users className="mr-2 h-4 w-4" />
                          Inviter des collaborateurs
                        </Button>
                        <Button variant="outline" size="sm">
                          <Paperclip className="mr-2 h-4 w-4" />
                          Pièces jointes
                        </Button>
                      </>
                    )}
                    
                    {request.status === 'validated' && (
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Voyage confirmé et prêt</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}